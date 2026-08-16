<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Sincery Prestations') }}</title>

    <link rel="icon" type="image/png" href="{{ asset('logos/favicon.png') }}">
    <link rel="shortcut icon" type="image/png" href="{{ asset('logos/favicon.png') }}">

    @env('local')
        <script type="module">
            window.$RefreshReg$ = window.$RefreshReg$ || (() => {});
            window.$RefreshSig$ = window.$RefreshSig$ || (() => (type) => type);
            try {
                const mod = await import('/@react-refresh');
                if (mod && typeof mod.injectIntoGlobalHook === 'function') {
                    mod.injectIntoGlobalHook(window);
                }
            } catch (_) {}
        </script>
    @endenv

    @vite(['resources/css/app.css', 'resources/js/index.tsx'])
</head>

<body>
    <div id="root"></div>
</body>

</html>
