<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
<!-- Bootstrap Icons CDN -->
    <link  rel="stylesheet"  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"/><script src="https://cdn.tailwindcss.com"></script>
    <style>
        body{
            height: 95vh;
            width: 99%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: whitesmoke;
            background-size: cover;
            background-position: center;
        }

    /* Firefox */
    * {
        scrollbar-width: thin;
        scrollbar-color: #5F9598 rgba(243, 244, 244, 0.035);
    }

    /* Chrome / Edge / Brave / Safari */
    ::-webkit-scrollbar {
        width: 7px;
        height: 7px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(243, 244, 244, 0.035);
        border-radius: 10px;
        margin: 4px 0;
    }

    ::-webkit-scrollbar-thumb {
        background: #5F9598;
        border-radius: 10px;
        border: 1px solid rgba(95, 149, 152, 0.08);
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #1D546D;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }
</style>
</head>
<body>
    <div id="app"></div>
</body>
</html>