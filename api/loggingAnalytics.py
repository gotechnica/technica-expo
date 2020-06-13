import logging

# setting WSGI logger to console only ERROR
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Define custom logger
# logging.config.fileConfig('logging.conf')
# logger.setLevel(logging.DEBUG)
logger = logging.getLogger('analytics_logger')
logger.setLevel(logging.DEBUG)

# creating file handler
file_handler = logging.FileHandler('analytics.log', mode='w', encoding='UTF-8')
file_handler.setLevel(logging.DEBUG)

# creating formatter
formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# add formatter
file_handler.setFormatter(formatter)

# add handler
logger.addHandler(file_handler)

###
# Public endpoint logging
###


def logged_message(message: str) -> None:
    logger.info(message)
    return
