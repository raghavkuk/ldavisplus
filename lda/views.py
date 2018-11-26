# Django imports
from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from django.core.serializers.json import DjangoJSONEncoder

# Third party imports
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
import pandas as pd
from scipy.spatial.distance import squareform
from scipy.spatial.distance import pdist
from sklearn.decomposition import PCA
import json

# Application imports
from .models import Document


def lda(request):
    objs = Document.objects.filter(dataset_type=1)
    docs = []
    doc_length = []
    for o in objs:
        docs.append(o.text)
        doc_length.append(len(o.text.split()))
    total_docs = len(docs)
    doc = Document.objects.first()

    no_features = 1000
    tf_vectorizer = CountVectorizer(max_df=0.95, min_df=2, max_features=no_features, stop_words='english')
    tf = tf_vectorizer.fit_transform(docs)
    tf_feature_names = tf_vectorizer.get_feature_names()

    word_dict = tf_vectorizer.vocabulary_

    n_topics = 10
    lda_model = LatentDirichletAllocation(n_components=n_topics, max_iter=5, learning_method='online', learning_offset=50., random_state=0).fit(tf)
    
    # Shape of lda components is (n_topics * no_features)
    # print(lda_model.components_)
    
    vocab = ['']*len(word_dict.keys())
    # print(len(word_dict))

    for key, value in word_dict.items():
        vocab[value] = key
    
    # print(vocab)

    phi = lda_model.components_
    theta = lda_model.transform(tf)
    R = 30
    lambda_step = 0.01
    lambda_seq = [i/100 for i in range(0,100+1)]
    dense_mat = np.array(tf.todense().sum(axis=0))
    tem_freq = list(dense_mat[0,:])
    # print(doc_length)

    ################################################################
    ################################################################
    ###############################################################


    def jsPCA(X):

        def jsdiv(P, Q):
            def _kldiv(A, B):
                return np.sum([v for v in A * np.log2(A/B) if not np.isnan(v)])
            P = np.array(P)
            Q = np.array(Q)

            M = 0.5 * (P + Q)
            return 0.5 * (_kldiv(P, M) +_kldiv(Q, M))

        Y = pdist(X, jsdiv)    
        Y = squareform(Y)
        pca = PCA(n_components=2)
        pca.fit(Y)
        pca_y = pca.transform(Y)
        return pd.DataFrame(pca_y, columns=["x", "y"])

    phi_np = np.array(phi)
    theta_np = np.array(theta)

    doc_length_np = np.array(doc_length)

    tem_freq_np = np.array(tem_freq)

    N = np.sum(doc_length_np)

    W = len(vocab)

    D = len(doc_length_np)

    dt = theta_np.shape

    dp = phi_np.shape

    K = dt[1]

    topic_frequency = np.sum(theta_np*(doc_length_np.reshape((doc_length_np.shape[0],1))), axis=0)

    topic_proportion = topic_frequency/ np.sum(topic_frequency)

    o = np.argsort(topic_proportion)[::-1]
    phi_np_o = phi_np[o, :]

    theta_np_o = theta_np[:,o]

    topic_frequency_o = topic_frequency[o]
    topic_proportion_o = topic_proportion[o]

    ## this was calculated using R PCA

    # mds_res = np.array([[-0.01031051, 0.03131592],
    # [-0.05265725, -0.01984672],
    # [0.06296776, -0.01146921]])

    mds_res = jsPCA(phi_np_o)

    # import pandas as pd
    mds_df = pd.DataFrame(mds_res, columns=["x", "y"])

    mds_df['topics'] = [i for i in range(K)]

    mds_df['Freq'] = topic_proportion_o*100

    mds_df['cluster'] = 1

    term_topic_freq = phi_np_o*topic_frequency_o.reshape((topic_frequency_o.shape[0],1))

    term_frequency = np.sum(term_topic_freq, axis=0)

    term_proportion = term_frequency/np.sum(term_frequency)

    phi_np_o = phi_np_o.T

    topic_given_term = phi_np_o/np.sum(phi_np_o, axis=1).reshape((np.sum(phi_np_o, axis=1).shape[0], 1))

    kernel = topic_given_term * np.log(topic_given_term /  topic_proportion_o)

    distinctiveness = np.sum(kernel, axis=1)

    saliency = term_proportion*distinctiveness

    vocab=np.array(vocab)


    default_terms = vocab[np.argsort(saliency)[::-1]][:R]

    counts = term_frequency[[i for i, x in enumerate(vocab) if x in default_terms]]

    counts = counts.astype(int)

    Rs = [i for i in range(R)][::-1]

    # default <- data.frame(Term = default_terms, logprob = Rs, loglift = Rs, 
    #                       Freq = counts, Total = counts, Category = "Default", 
    #                       stringsAsFactors = FALSE)


    default = pd.DataFrame(columns = ['Term', 'logprob', 'loglift', 'Freq', 'Total', 'Category'])

    default['Term'] = default_terms
    default['logprob'] = Rs

    default['loglift'] = Rs
    default['Freq'] = counts
    default['Total'] = counts
    default['Category'] = "Default"

    topic_seq = [i for i in range(K) for j in range(R)]

    category = ["Topic"+str(i) for i in topic_seq]

    lift =  phi_np_o / term_proportion.reshape((term_proportion.shape[0], 1))

    def find_relevance(i):
        relevance  = i * np.log(phi_np_o) + (1-i)*np.log(lift)
        idx = np.argsort(-relevance, axis=0)[:R,:]
        idx_flt = idx.flatten(order='F')
        indices = pd.DataFrame(columns=['V1', 'topic_seq'])
        indices['V1'] = idx_flt
        indices['topic_seq'] = topic_seq
        df_ret = pd.DataFrame(columns=['Term', 'Category', 'logprob', 'loglift'])
        df_ret['Term'] = vocab[idx].flatten(order='F')
        df_ret['Category'] = category
        df_ret['logprob'] = np.log(phi_np_o[[indices['V1'], indices['topic_seq']]])
        df_ret['loglift'] = np.log(lift[[indices['V1'], indices['topic_seq']]])
        return df_ret


    tinfo = [find_relevance(i) for i in lambda_seq]

    tinfo_unq = (pd.concat(tinfo, axis=0)).drop_duplicates()

    indices = [np.where(vocab == i)[0][0]  for i in tinfo_unq['Term'].values]

    tinfo_unq['Total'] = term_frequency[[indices]]

    term_topic_freq_df = pd.DataFrame(term_topic_freq, columns=vocab)

    term_topic_freq_df['Topics'] = ['Topic'+str(i) for i in range(term_topic_freq_df.shape[0])]

    term_topic_freq_df.set_index('Topics', inplace=True)

    tinfo_unq['Freq'] = [term_topic_freq_df[i][j] for i, j in zip(tinfo_unq['Term'], tinfo_unq['Category'])]

    tinfo_unq = pd.concat([default, tinfo_unq], axis=0)

    ut = sorted(tinfo_unq['Term'].unique())

    m = [np.where(vocab == i)[0][0]  for i in ut]

    tmp = term_topic_freq_df[:][ut]

    Freq_dd = np.array(tmp).ravel(order='F')

    Topic_dd = list(tmp.index)*len(tmp.columns)

    Term_dd = [i for i in list(tmp.columns) for j in range(len(tmp.index)) ]

    dd = pd.DataFrame(columns=['Term', 'Topic', 'Freq'])

    dd['Term'] = Term_dd
    dd['Topic'] = Topic_dd
    dd['Freq'] = Freq_dd

    dd = dd[dd['Freq'] > 0.5]

    dd['Term_freq'] = dd['Term']

    dd['Term_freq'] = dd['Term_freq'].apply(lambda x: term_frequency[np.where(vocab == x)][0])

    dd['Freq'] = dd['Freq'] / dd['Term_freq']

    dd = dd.sort_values(by=['Term', 'Topic'])

    dd = dd.drop(['Term_freq'], 1)

    mds_df_dict = {
        "x": mds_df['x'].tolist(),
        "y": mds_df['y'].tolist(),
        "topics": [int(int(i) + 1) for i in mds_df['topics'].tolist()],
        "Freq": mds_df['Freq'].tolist(),
        "cluster": mds_df['cluster'].tolist()
    }

    tinfo_unq_dict = {
        "Term": tinfo_unq['Term'].tolist(),
        "logprob": tinfo_unq['logprob'].tolist(),
        "loglift":tinfo_unq['loglift'].tolist(),
        "Freq":tinfo_unq['Freq'].tolist(),
        "Total":tinfo_unq['Total'].tolist(),
        "Category": tinfo_unq['Category'].tolist()
    }

    # print(dd['Topic'].tolist())

    dd_dict = {
        "Term":dd['Term'].tolist(),
        "Topic":[int(int(i[5:]) + 1) for i in dd['Topic'].tolist()],
        "Freq":dd['Freq'].tolist()
    }

    dict_return = {}
    dict_return["mdsDat"] = mds_df_dict
    dict_return["tinfo"] = tinfo_unq_dict
    dict_return["token.table"] = dd_dict
    dict_return["R"] = R
    dict_return["lambda.step"] = lambda_step
    dict_return["topic.order"] = [int(int(i) + 1) for i in o.tolist()]

    lda_json = json.dumps(dict_return, cls=DjangoJSONEncoder)
    return render(request, "index.html", {'total_docs': total_docs, 'data': lda_json})