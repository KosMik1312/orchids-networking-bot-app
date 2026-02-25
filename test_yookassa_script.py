import logging
import uuid
import sys
from yookassa import Configuration, Payment

logging.basicConfig(level=logging.INFO)
Configuration.configure('1247817', 'live_MQWRpQKNQxtNxjKxRpWIUyfe7fIZ7xh2R89qVWPdny8')

params = {
    'amount': {'value': '1500.00', 'currency': 'RUB'},
    'confirmation': {'type': 'redirect', 'return_url': 'http://test.com'},
    'capture': True,
    'description': 'test',
    'receipt': {
        'customer': {'email': 'test@example.com'},
        'items': [{
            'description': 'test item',
            'quantity': '1.00',
            'amount': {'value': '1500.00', 'currency': 'RUB'},
            'vat_code': 1,
            'payment_mode': 'full_payment',
            'payment_subject': 'service'
        }]
    }
}
try:
    res = Payment.create(params, idempotency_key=str(uuid.uuid4()))
    print('Success:', res.id)
except Exception as e:
    if hasattr(e, 'response') and hasattr(e.response, 'text'):
        print('Error JSON:', e.response.text)
    else:
        print('Error:', str(e))
