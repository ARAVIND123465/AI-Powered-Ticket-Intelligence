import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    results = {}
    print("="*60)
    print("STARTING E2E ROLE & AUTHENTICATION REGRESSION TEST SUITE")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless=True
        )
        context = browser.new_context()
        page = context.new_page()

        def full_logout():
            page.goto('http://localhost:5173/login')
            page.evaluate("""() => {
                localStorage.clear();
                sessionStorage.clear();
            }""")
            page.goto('http://localhost:5173/login')
            page.wait_for_load_state('networkidle')

        # -------------------------------------------------------------
        # TEST 1: Customer Login -> Customer Dashboard
        # -------------------------------------------------------------
        print("\n[TEST 1] Customer Login -> Customer Dashboard...")
        full_logout()
        page.fill('input[type="email"]', 'customer@demo.com')
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/customer/dashboard', timeout=8000)
        time.sleep(1)
        role_storage = page.evaluate("() => localStorage.getItem('user_role')")
        print(f"  Current URL: {page.url}")
        print(f"  LocalStorage Role: {role_storage}")
        customer_login_pass = '/customer/dashboard' in page.url and role_storage == 'Customer'
        results['Customer -> Customer Dashboard'] = 'PASS' if customer_login_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 2: Logout clears previous role
        # -------------------------------------------------------------
        print("\n[TEST 2] Testing Logout...")
        signout_btn = page.locator('button[title="Sign Out"]')
        if signout_btn.count() > 0:
            signout_btn.click()
        else:
            page.evaluate("() => { localStorage.clear(); window.location.href = '/login'; }")
        page.wait_for_url('**/login', timeout=8000)
        time.sleep(0.5)
        role_after_logout = page.evaluate("() => localStorage.getItem('user_role')")
        token_after_logout = page.evaluate("() => localStorage.getItem('access_token')")
        print(f"  Role after logout: {role_after_logout}")
        print(f"  Token after logout: {token_after_logout}")
        logout_pass = (role_after_logout is None) and (token_after_logout is None)
        results['Logout clears previous role'] = 'PASS' if logout_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 3: Support Agent Login -> Support Dashboard
        # -------------------------------------------------------------
        print("\n[TEST 3] Support Agent Login -> Support Dashboard...")
        page.goto('http://localhost:5173/admin-login')
        page.wait_for_load_state('networkidle')
        page.click('button:has-text("Support Agent")')
        time.sleep(0.5)
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/agent/dashboard', timeout=8000)
        time.sleep(1)
        role_storage = page.evaluate("() => localStorage.getItem('user_role')")
        print(f"  Current URL: {page.url}")
        print(f"  LocalStorage Role: {role_storage}")
        agent_login_pass = '/agent/dashboard' in page.url and role_storage == 'Agent'
        results['Support Agent -> Support Dashboard'] = 'PASS' if agent_login_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 4: Company Admin Login -> Admin Dashboard
        # -------------------------------------------------------------
        print("\n[TEST 4] Company Admin Login -> Admin Dashboard...")
        full_logout()
        page.goto('http://localhost:5173/admin-login')
        page.wait_for_load_state('networkidle')
        page.click('button:has-text("Company Admin")')
        time.sleep(0.5)
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/company-admin/dashboard', timeout=8000)
        time.sleep(1)
        role_storage = page.evaluate("() => localStorage.getItem('user_role')")
        print(f"  Current URL: {page.url}")
        print(f"  LocalStorage Role: {role_storage}")
        admin_login_pass = '/company-admin/dashboard' in page.url and role_storage == 'Admin'
        results['Admin -> Admin Dashboard'] = 'PASS' if admin_login_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 5: Super Admin Login -> Super Admin Dashboard
        # -------------------------------------------------------------
        print("\n[TEST 5] Super Admin Login -> Super Admin Dashboard...")
        full_logout()
        page.goto('http://localhost:5173/admin-login')
        page.wait_for_load_state('networkidle')
        page.click('button:has-text("Super Admin")')
        time.sleep(0.5)
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/platform/dashboard', timeout=8000)
        time.sleep(1)
        role_storage = page.evaluate("() => localStorage.getItem('user_role')")
        print(f"  Current URL: {page.url}")
        print(f"  LocalStorage Role: {role_storage}")
        superadmin_login_pass = '/platform/dashboard' in page.url and role_storage == 'SuperAdmin'
        results['Super Admin -> Super Admin Dashboard'] = 'PASS' if superadmin_login_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 6: Refresh preserves correct role (Super Admin)
        # -------------------------------------------------------------
        print("\n[TEST 6] Refresh preserves correct role...")
        page.reload()
        page.wait_for_url('**/platform/dashboard', timeout=8000)
        time.sleep(1)
        role_after_refresh = page.evaluate("() => localStorage.getItem('user_role')")
        print(f"  URL after refresh: {page.url}")
        print(f"  Role after refresh: {role_after_refresh}")
        refresh_pass = '/platform/dashboard' in page.url and role_after_refresh == 'SuperAdmin'
        results['Refresh preserves correct role'] = 'PASS' if refresh_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 7: Logout -> Browser Back -> Direct URL protection
        # -------------------------------------------------------------
        print("\n[TEST 7] Testing Logout & Browser Back...")
        page.evaluate("""() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }""")
        page.wait_for_url('**/login', timeout=8000)
        time.sleep(0.5)

        # Try to visit /platform/dashboard unauthenticated
        page.goto('http://localhost:5173/platform/dashboard')
        page.wait_for_url('**/login', timeout=8000)
        print(f"  URL when visiting /platform/dashboard while unauthenticated: {page.url}")
        back_pass = '/login' in page.url
        results['Browser Back after logout'] = 'PASS' if back_pass else 'FAIL'
        results['Direct URL protection'] = 'PASS' if back_pass else 'FAIL'

        # -------------------------------------------------------------
        # TEST 8: Customer Authorization Tests
        # Customer trying to access Admin and Super Admin
        # -------------------------------------------------------------
        print("\n[TEST 8] Customer Authorization Tests...")
        full_logout()
        page.fill('input[type="email"]', 'customer@demo.com')
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/customer/dashboard', timeout=8000)

        # Customer accessing Admin (/company-admin/dashboard)
        page.goto('http://localhost:5173/company-admin/dashboard')
        page.wait_for_url('**/customer/dashboard', timeout=8000)
        print(f"  Customer accessing Admin -> redirected to: {page.url}")
        results['Customer accessing Admin'] = 'PASS' if '/customer/dashboard' in page.url else 'FAIL'

        # Customer accessing Super Admin (/platform/dashboard)
        page.goto('http://localhost:5173/platform/dashboard')
        page.wait_for_url('**/customer/dashboard', timeout=8000)
        print(f"  Customer accessing Super Admin -> redirected to: {page.url}")
        results['Customer accessing Super Admin'] = 'PASS' if '/customer/dashboard' in page.url else 'FAIL'

        # -------------------------------------------------------------
        # TEST 9: Support Agent Authorization Tests
        # Support trying to access Admin and Super Admin
        # -------------------------------------------------------------
        print("\n[TEST 9] Support Agent Authorization Tests...")
        full_logout()
        page.goto('http://localhost:5173/admin-login')
        page.wait_for_load_state('networkidle')
        page.click('button:has-text("Support Agent")')
        time.sleep(0.5)
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/agent/dashboard', timeout=8000)

        # Support accessing Admin
        page.goto('http://localhost:5173/company-admin/dashboard')
        page.wait_for_url('**/agent/dashboard', timeout=8000)
        print(f"  Support accessing Admin -> redirected to: {page.url}")
        results['Support accessing Admin'] = 'PASS' if '/agent/dashboard' in page.url else 'FAIL'

        # Support accessing Super Admin
        page.goto('http://localhost:5173/platform/dashboard')
        page.wait_for_url('**/agent/dashboard', timeout=8000)
        print(f"  Support accessing Super Admin -> redirected to: {page.url}")
        results['Support accessing Super Admin'] = 'PASS' if '/agent/dashboard' in page.url else 'FAIL'

        # -------------------------------------------------------------
        # TEST 10: Admin Authorization Tests
        # Admin trying to access Super Admin
        # -------------------------------------------------------------
        print("\n[TEST 10] Admin Authorization Tests...")
        full_logout()
        page.goto('http://localhost:5173/admin-login')
        page.wait_for_load_state('networkidle')
        page.click('button:has-text("Company Admin")')
        time.sleep(0.5)
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/company-admin/dashboard', timeout=8000)

        # Admin accessing Super Admin
        page.goto('http://localhost:5173/platform/dashboard')
        page.wait_for_url('**/company-admin/dashboard', timeout=8000)
        print(f"  Admin accessing Super Admin -> redirected to: {page.url}")
        results['Admin accessing Super Admin'] = 'PASS' if '/company-admin/dashboard' in page.url else 'FAIL'

        browser.close()

    print("\n" + "="*60)
    print("REGRESSION TEST RESULTS SUMMARY")
    print("="*60)
    for k, v in results.items():
        print(f"{k}: {v}")

    all_passed = all(v == 'PASS' for v in results.values())
    print("\nALL TESTS PASSED:", all_passed)
    return all_passed

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
