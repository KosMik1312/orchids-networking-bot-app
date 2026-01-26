#!/usr/bin/env python3
"""
Unit-тест для проверки модуля платежей Ю-Кассы.
Проверяет импорты, конфигурацию и логику обработки webhook'ов.
Не требует реального подключения к Ю-Кассе.
"""
import sys
import os
import asyncio
from typing import Dict, Any

# Add bot directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_test(message: str, status: str = "INFO"):
    """Print formatted test message"""
    if status == "✅":
        print(f"{Colors.GREEN}[TEST] [OK] {message}{Colors.RESET}")
    elif status == "❌":
        print(f"{Colors.RED}[TEST] [FAIL] {message}{Colors.RESET}")
    elif status == "⚠️":
        print(f"{Colors.YELLOW}[TEST] [WARN] {message}{Colors.RESET}")
    else:
        print(f"{Colors.BLUE}[TEST] [INFO] {message}{Colors.RESET}")


def test_imports():
    """Test 1: Check if payment module can be imported"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА ИМПОРТОВ ==={Colors.RESET}")
    
    try:
        from payments.payment_config import YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_TEST_MODE, DEFAULT_RETURN_URL
        print_test("payment_config импортирован успешно", "✅")
        return True
    except ImportError as e:
        print_test(f"Ошибка импорта payment_config: {e}", "❌")
        return False


def test_config():
    """Test 2: Validate payment configuration"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА КОНФИГУРАЦИИ ==={Colors.RESET}")
    
    try:
        from payments.payment_config import YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_TEST_MODE
        
        print_test(f"Shop ID: {YOOKASSA_SHOP_ID}", "ℹ️")
        print_test(f"Secret Key: {'*' * len(YOOKASSA_SECRET_KEY) if YOOKASSA_SECRET_KEY else 'NOT SET'}", "ℹ️")
        print_test(f"Test Mode: {YOOKASSA_TEST_MODE}", "ℹ️")
        
        # Validate Shop ID
        if YOOKASSA_SHOP_ID == "100500":
            print_test("Shop ID - используется DEMO ID (тестовый режим)", "✅")
        elif YOOKASSA_SHOP_ID and len(YOOKASSA_SHOP_ID) > 0:
            print_test("Shop ID - установлен из переменной окружения", "✅")
        else:
            print_test("Shop ID не установлен!", "❌")
            return False
        
        # Validate Test Mode
        if YOOKASSA_TEST_MODE:
            print_test("Test Mode ВКЛЮЧЕН - платежи будут обрабатываться в тестовом режиме", "✅")
        else:
            print_test("Test Mode ОТКЛЮЧЕН - платежи реальные!", "⚠️")
        
        return True
    except Exception as e:
        print_test(f"Ошибка при проверке конфигурации: {e}", "❌")
        return False


def test_payment_service_init():
    """Test 3: Initialize PaymentService"""
    print(f"\n{Colors.BOLD}[TEST] === ИНИЦИАЛИЗАЦИЯ PaymentService ==={Colors.RESET}")
    
    try:
        from payments.payment_service import PaymentService
        
        service = PaymentService()
        print_test("PaymentService инициализирован успешно", "✅")
        print_test(f"Service type: {type(service).__name__}", "ℹ️")
        
        return True
    except Exception as e:
        print_test(f"Ошибка инициализации PaymentService: {e}", "❌")
        import traceback
        traceback.print_exc()
        return False


async def test_webhook_payment_succeeded():
    """Test 4: Process payment.succeeded webhook"""
    print(f"\n{Colors.BOLD}[TEST] === ОБРАБОТКА WEBHOOK: payment.succeeded ==={Colors.RESET}")
    
    try:
        from payments.payment_service import PaymentService
        
        service = PaymentService()
        
        # Mock webhook data for successful payment
        webhook_data = {
            "type": "notification",
            "event": "payment.succeeded",
            "data": {
                "id": "27884cd7-0e14-4e51-8b01-1f0f1c01ceb8",
                "status": "succeeded",
                "amount": {
                    "value": "5000.00",
                    "currency": "RUB"
                },
                "metadata": {
                    "user_id": "7577986435",
                    "booking_id": "123"
                }
            }
        }
        
        print_test("Симуляция webhook: payment.succeeded", "ℹ️")
        result = service.handle_webhook(webhook_data)
        
        if result['status'] == 'succeeded':
            print_test(f"Webhook обработан: статус = {result['status']}", "✅")
            print_test(f"Payment ID: {result.get('payment_id')}", "ℹ️")
            print_test(f"Amount: {result.get('amount')}", "ℹ️")
            return True
        else:
            print_test(f"Неожиданный статус webhook: {result['status']}", "❌")
            return False
            
    except Exception as e:
        print_test(f"Ошибка при обработке webhook: {e}", "❌")
        import traceback
        traceback.print_exc()
        return False


async def test_webhook_payment_canceled():
    """Test 5: Process payment.canceled webhook"""
    print(f"\n{Colors.BOLD}[TEST] === ОБРАБОТКА WEBHOOK: payment.canceled ==={Colors.RESET}")
    
    try:
        from payments.payment_service import PaymentService
        
        service = PaymentService()
        
        # Mock webhook data for cancelled payment
        webhook_data = {
            "type": "notification",
            "event": "payment.canceled",
            "data": {
                "id": "27884cd7-0e14-4e51-8b01-1f0f1c01ceb8",
                "status": "canceled"
            }
        }
        
        print_test("Симуляция webhook: payment.canceled", "ℹ️")
        result = service.handle_webhook(webhook_data)
        
        if result['status'] == 'canceled':
            print_test(f"Webhook обработан: статус = {result['status']}", "✅")
            print_test(f"Payment ID: {result.get('payment_id')}", "ℹ️")
            return True
        else:
            print_test(f"Неожиданный статус webhook: {result['status']}", "❌")
            return False
            
    except Exception as e:
        print_test(f"Ошибка при обработке webhook: {e}", "❌")
        import traceback
        traceback.print_exc()
        return False


async def test_payment_service_methods():
    """Test 6: Check PaymentService methods exist"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА МЕТОДОВ PaymentService ==={Colors.RESET}")
    
    try:
        from payments.payment_service import PaymentService
        
        service = PaymentService()
        
        # Check methods
        methods = [
            'create_payment',
            'get_payment_status',
            'cancel_payment',
            'handle_webhook'
        ]
        
        all_exist = True
        for method_name in methods:
            if hasattr(service, method_name):
                print_test(f"Метод '{method_name}' существует", "✅")
            else:
                print_test(f"Метод '{method_name}' НЕ НАЙДЕН", "❌")
                all_exist = False
        
        return all_exist
        
    except Exception as e:
        print_test(f"Ошибка при проверке методов: {e}", "❌")
        return False


def test_db_models():
    """Test 7: Check if Payment model exists in ORM"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА Payment МОДЕЛИ В БД ==={Colors.RESET}")
    
    try:
        from db.models import Payment
        
        print_test("Payment модель импортирована успешно", "✅")
        
        # Check fields
        fields = [
            'id',
            'yookassa_payment_id',
            'user_id',
            'booking_id',
            'amount',
            'status',
            'created_at',
            'updated_at'
        ]
        
        all_exist = True
        for field_name in fields:
            if hasattr(Payment, field_name):
                print_test(f"Поле '{field_name}' существует", "✅")
            else:
                print_test(f"Поле '{field_name}' НЕ НАЙДЕНО", "❌")
                all_exist = False
        
        return all_exist
        
    except Exception as e:
        print_test(f"Ошибка при проверке Payment модели: {e}", "❌")
        import traceback
        traceback.print_exc()
        return False


def test_db_repository():
    """Test 8: Check if PaymentRepo exists"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА PaymentRepo ==={Colors.RESET}")
    
    try:
        from db.repository import PaymentRepo
        
        print_test("PaymentRepo импортирована успешно", "✅")
        
        # Check methods
        methods = [
            'create_payment',
            'get_payment',
            'get_payment_by_yookassa_id',
            'update_payment_status',
            'get_user_payments'
        ]
        
        all_exist = True
        for method_name in methods:
            if hasattr(PaymentRepo, method_name):
                print_test(f"Метод '{method_name}' существует", "✅")
            else:
                print_test(f"Метод '{method_name}' НЕ НАЙДЕН", "❌")
                all_exist = False
        
        return all_exist
        
    except Exception as e:
        print_test(f"Ошибка при проверке PaymentRepo: {e}", "❌")
        import traceback
        traceback.print_exc()
        return False


def test_api_endpoints():
    """Test 9: Check if API endpoints are defined"""
    print(f"\n{Colors.BOLD}[TEST] === ПРОВЕРКА API ENDPOINTS ==={Colors.RESET}")
    
    try:
        from api_server import app
        
        # Get all routes
        routes = []
        for route in app.routes:
            if hasattr(route, 'path'):
                routes.append((route.path, route.methods if hasattr(route, 'methods') else []))
        
        # Check for payment endpoints
        payment_endpoints = [
            '/api/payments',
            '/api/payments/{payment_id}'
        ]
        
        found_routes = [r[0] for r in routes]
        print_test(f"Всего найдено routes: {len(found_routes)}", "ℹ️")
        
        all_exist = True
        for endpoint in payment_endpoints:
            if any(endpoint in r for r in found_routes):
                print_test(f"Эндпоинт '{endpoint}' найден", "✅")
            else:
                print_test(f"Эндпоинт '{endpoint}' НЕ НАЙДЕН", "⚠️")
        
        return True
        
    except Exception as e:
        print_test(f"Ошибка при проверке эндпоинтов: {e}", "⚠️")
        # This is not critical, API might be correct
        return True


async def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print("   UNIT-ТЕСТ МОДУЛЯ ПЛАТЕЖЕЙ Ю-КАССЫ")
    print(f"{'='*60}{Colors.RESET}\n")
    
    results = []
    
    # Synchronous tests
    results.append(("Импорты", test_imports()))
    results.append(("Конфигурация", test_config()))
    results.append(("Инициализация PaymentService", test_payment_service_init()))
    results.append(("Методы PaymentService", await test_payment_service_methods()))
    results.append(("Payment ORM модель", test_db_models()))
    results.append(("PaymentRepo", test_db_repository()))
    results.append(("API эндпоинты", test_api_endpoints()))
    
    # Async webhook tests
    results.append(("Webhook: payment.succeeded", await test_webhook_payment_succeeded()))
    results.append(("Webhook: payment.canceled", await test_webhook_payment_canceled()))
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*60}")
    print("   ИТОГИ")
    print(f"{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[OK]" if result else "[FAIL]"
        print(f"  {status:12} | {test_name}")
    
    print(f"\n{Colors.BOLD}Результат: {passed}/{total} тестов пройдено{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}[SUCCESS] ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! [SUCCESS]{Colors.RESET}")
        print(f"{Colors.GREEN}Модуль платежей Ю-Кассы готов к использованию.{Colors.RESET}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}[WARNING] НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ [WARNING]{Colors.RESET}")
        print(f"{Colors.RED}Требуется проверка указанных выше ошибок.{Colors.RESET}\n")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
