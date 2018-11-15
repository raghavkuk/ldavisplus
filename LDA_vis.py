phi = [[0.5, 0.1, 0.1, 0.1, 0.2],
[0.1, 0.2, 0.3, 0.2, 0.2],
[0.2, 0.1, 0.1, 0.1, 0.5]]

theta = [[0.7, 0.2, 0.1],
          [0.2, 0.2, 0.6], 
          [0.5, 0.1, 0.4], 
          [0.4, 0.4, 0.2], 
          [0.2, 0.1, 0.7], 
          [0.1, 0.1, 0.8], 
          [0.3, 0.3, 0.4], 
          [0.3, 0.2, 0.5], 
          [0.3, 0.1, 0.6], 
          [0.1, 0.2, 0.7]]


doc_length = [5,10,4,6,8,4,12,5,9,10]
tem_freq=  [17, 20, 40, 23, 17]

lambda_step = 0.01
lambda_seq = [i/100 for i in range(0,100+1)]

vocab = ["aa", "bb", "cc", "dd", "ee"]
R = 2


# phi = lada_model.components_
# theta = lada_model.transform(X)
# doc_length
# tem_freq




import numpy as np
import pandas as pd


# In[4]:


def jsPCA(X):
    from scipy.spatial.distance import squareform
    from scipy.spatial.distance import pdist
    from sklearn.decomposition import PCA

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


# In[5]:


phi_np = np.array(phi)
theta_np = np.array(theta)


# In[6]:


doc_length_np = np.array(doc_length)


# In[7]:


tem_freq_np = np.array(tem_freq)


# In[8]:


N = np.sum(doc_length_np)


# In[9]:


W = len(vocab)


# In[10]:


D = len(doc_length_np)


# In[11]:


dt = theta_np.shape


# In[12]:


dp = phi_np.shape


# In[13]:


K = dt[1]


# In[14]:


topic_frequency = np.sum(theta_np*(doc_length_np.reshape((10,1))), axis=0)


# In[15]:


topic_proportion = topic_frequency/ np.sum(topic_frequency)


# In[16]:


o = np.argsort(topic_proportion)[::-1]


# In[17]:


phi_np_o = phi_np[o, :]


# In[18]:


theta_np_o = theta_np[:,o]


# In[19]:


topic_frequency_o = topic_frequency[o]
topic_proportion_o = topic_proportion[o]


# In[20]:


## this was calculated using R PCA

# mds_res = np.array([[-0.01031051, 0.03131592],
# [-0.05265725, -0.01984672],
# [0.06296776, -0.01146921]])

mds_res = jsPCA(phi_np_o)


# In[21]:


import pandas as pd
mds_df = pd.DataFrame(mds_res, columns=["x", "y"])


# In[22]:


mds_df['topics'] = [i for i in range(K)]


# In[23]:


mds_df['Freq'] = topic_proportion_o*100


# In[24]:


mds_df['cluster'] = 1


# In[25]:


term_topic_freq = phi_np_o*topic_frequency_o.reshape((topic_frequency_o.shape[0],1))


# In[26]:


term_frequency = np.sum(term_topic_freq, axis=0)


# In[27]:


term_proportion = term_frequency/np.sum(term_frequency)


# In[28]:


phi_np_o = phi_np_o.T


# In[29]:


topic_given_term = phi_np_o/np.sum(phi_np_o, axis=1).reshape((np.sum(phi_np_o, axis=1).shape[0], 1))


# In[30]:


kernel = topic_given_term * np.log(topic_given_term /  topic_proportion_o)


# In[31]:


distinctiveness = np.sum(kernel, axis=1)


# In[32]:


saliency = term_proportion*distinctiveness


# In[33]:


vocab=np.array(vocab)


# In[34]:


default_terms = vocab[np.argsort(saliency)[::-1]][:R]


# In[35]:


counts = term_frequency[[i for i, x in enumerate(vocab) if x in default_terms]]


# In[36]:


counts = counts.astype(int)


# In[37]:


Rs = [i for i in range(R)][::-1]


# In[38]:


# default <- data.frame(Term = default_terms, logprob = Rs, loglift = Rs, 
#                       Freq = counts, Total = counts, Category = "Default", 
#                       stringsAsFactors = FALSE)


# In[39]:


default = pd.DataFrame(columns = ['Term', 'logprob', 'loglift', 'Freq', 'Total', 'Category'])


# In[40]:


default['Term'] = default_terms
default['logprob'] = Rs


# In[41]:


default['loglift'] = Rs
default['Freq'] = counts
default['Total'] = counts
default['Category'] = "Default"


# In[42]:


topic_seq = [i for i in range(K) for j in range(R)]


# In[43]:


category = ["Topic"+str(i) for i in topic_seq]


# In[44]:


lift =  phi_np_o / term_proportion.reshape((term_proportion.shape[0], 1))


# In[45]:


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


# In[46]:


tinfo = [find_relevance(i) for i in lambda_seq]


# In[47]:


tinfo_unq = (pd.concat(tinfo, axis=0)).drop_duplicates()


# In[48]:


indices = [np.where(vocab == i)[0][0]  for i in tinfo_unq['Term'].values]


# In[49]:


tinfo_unq['Total'] = term_frequency[[indices]]


# In[50]:


term_topic_freq_df = pd.DataFrame(term_topic_freq, columns=vocab)


# In[51]:


term_topic_freq_df['Topics'] = ['Topic'+str(i) for i in range(term_topic_freq_df.shape[0])]


# In[52]:


term_topic_freq_df.set_index('Topics', inplace=True)


# In[53]:


tinfo_unq['Freq'] = [term_topic_freq_df[i][j] for i, j in zip(tinfo_unq['Term'], tinfo_unq['Category'])]


# In[54]:


tinfo_unq = pd.concat([default, tinfo_unq], axis=0)


# In[55]:


ut = sorted(tinfo_unq['Term'].unique())


# In[56]:


m = [np.where(vocab == i)[0][0]  for i in ut]


# In[57]:


tmp = term_topic_freq_df[:][ut]


# In[58]:


Freq_dd = np.array(tmp).ravel(order='F')


# In[59]:


Topic_dd = list(tmp.index)*len(tmp.columns)


# In[60]:


Term_dd = [i for i in list(tmp.columns) for j in range(len(tmp.index)) ]


# In[61]:


dd = pd.DataFrame(columns=['Term', 'Topic', 'Freq'])


# In[62]:


dd['Term'] = Term_dd
dd['Topic'] = Topic_dd
dd['Freq'] = Freq_dd


# In[63]:


dd = dd[dd['Freq'] > 0.5]


# In[64]:


dd['Term_freq'] = dd['Term']


# In[65]:


dd['Term_freq'] = dd['Term_freq'].apply(lambda x: term_frequency[np.where(vocab == x)][0])


# In[66]:


dd['Freq'] = dd['Freq'] / dd['Term_freq']


# In[67]:


dd = dd.sort_values(by=['Term', 'Topic'])


# In[68]:


dd = dd.drop(['Term_freq'], 1)


# In[69]:


mds_df_dict = {
    "x": mds_df['x'].tolist(),
    "y": mds_df['y'].tolist(),
    "topics": mds_df['topics'].tolist(),
    "Freq": mds_df['Freq'].tolist(),
    "cluster": mds_df['cluster'].tolist() 
}


# In[70]:


tinfo_unq_dict = {
    "Term": tinfo_unq['Term'].tolist(),
    "logprob": tinfo_unq['logprob'].tolist(),
    "loglift":tinfo_unq['loglift'].tolist(),
    "Freq":tinfo_unq['Freq'].tolist(),
    "Total":tinfo_unq['Total'].tolist(),
    "Category": tinfo_unq['Category'].tolist()
}


# In[71]:


dd_dict = {
    'Term':dd['Term'].tolist(),
    'Topic':dd['Topic'].tolist(),
    'Freq':dd['Freq'].tolist()
}


# In[72]:


dict_return = {}
dict_return['mdsDat'] = mds_df_dict
dict_return['tinfo'] = tinfo_unq_dict
dict_return['token_table'] = dd_dict
dict_return['R'] = R
dict_return['lambda_step'] = lambda_step
dict_return['topic_order'] =  o.tolist()


# In[73]:


import json
with open('data1.json', 'w') as outfile:
    json.dump(dict_return, outfile)


# In[ ]:





# In[ ]: