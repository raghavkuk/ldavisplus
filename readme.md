This project runs with Python 3 only.

Open terminal and go to the application directory. Not inside but just outside the application's directory.

You need virtualenv python package to run the application.
pip3 install virtualenv

Now create a  virtual environment by the following command.
virtualenv venv

Now activate this virtual environment by this command if you are on mac or linux
source venv/bin/activate

for windows
venv/bin/activate

After activating the virtual environment
go inside the application's directory where you can find manage.py

Now install all the dependecies of the project by this command
pip3 install -r requirements.txt

This will install all the dependecies of the project in your virtual environment.
Now to run the server execute this command
python3 manage.py runserver

Now, Go to url http://localhost:8000/lda/ to see results.