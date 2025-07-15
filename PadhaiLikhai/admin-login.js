<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | PadhaiLikhai</title>
    <link rel="stylesheet" href="admin-style.css">
    <link rel="icon" type="image/png" href="icon-512.png">
</head>
<body>
    <div id="loader-overlay" class="hidden">
        <svg id="logo-loader" width="100" height="100" viewBox="0 0 100 100">
            <path class="logo-path" d="M 20 20 L 20 80 L 50 80 L 50 50 L 40 50" fill="none" stroke-width="5"/>
            <path class="logo-path" d="M 50 20 L 80 20 L 80 80" fill="none" stroke-width="5"/>
        </svg>
    </div>

    <div class="login-container">
        <div class="login-box">
            <div class="logo">
                <svg id="header-logo" width="40" height="40" viewBox="0 0 100 100">
                    <path d="M 20 20 L 20 80 L 50 80 L 50 50 L 40 50" fill="none" stroke-width="10"/>
                    <path d="M 50 20 L 80 20 L 80 80" fill="none" stroke-width="10"/>
                </svg>
                <span>PadhaiLikhai Admin</span>
            </div>
            <h2 class="title">Secure Admin Access</h2>
            <p class="subtitle">Enter your credentials to manage the hub.</p>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="admin-email">Email</label>
                    <input type="email" id="admin-email" required value="admin@padhai.com">
                </div>
                <div class="form-group">
                    <label for="admin-password">Password</label>
                    <input type="password" id="admin-password" required value="password123">
                </div>
                <p id="login-error-message" class="error-message"></p>
                <button type="submit" class="styled-button">Login</button>
            </form>
        </div>
    </div>

    <!-- Local Database Helper -->
    <script src="localDB.js"></script>
    <!-- Admin Login Logic -->
    <script src="admin-login.js"></script>
</body>
</html>
