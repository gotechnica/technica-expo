# Config file. Rename as config.py and fill in keys/variables

MONGO_DBNAME = 'your-db-name-here'
# e.g. 'expo-app'
MONGO_HOST = 'uri-to-connect-to-your-db-including-username-and-password'
# e.g. 'mongodb://<dbuser>:<dbpassword>@ds261460.mlab.com:61460/expo-app'
# (if using mLab) or
# 'mongodb://admin:password@db:27017/expo-testing?authSource=admin'
# for local development

ADMIN_ACCESS_CODE = 'super-secret-admin-access-code-here'
# Used to log into Godmode dashboard
SECRET_KEY = 'some-super-secret-string-used-for-flask-sessions'
# A long string of random characters

EXPO_LENGTH = 60
# Total length of the expo (in minutes).
# Used for computing time per table for sponsors.

# If you aren't allowing this option for hackers,
# replace the string with the python None variable
CUSTOM_DEVPOST_STAY_AT_TABLE_QUESTION = ('Exact string of the question '
                                         'configured in Devpost for checking '
                                         'which table a hack is currently at '
                                         '(if it must stay at that current '
                                         'table for expo).')
