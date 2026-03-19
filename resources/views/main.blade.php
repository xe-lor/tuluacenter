<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    <style>
        body{
            height: 95vh;
            width: 99%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #212529;
            background-size: cover;
            background-position: center;
        }
    </style>
</head>
<body>
    <div id="app"></div>
</body>
</html>