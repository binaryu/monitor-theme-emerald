import { addIcon } from "@iconify/vue"

const icons: Record<string, { body: string; width: number; height: number }> = {
  "icon-park-outline:dark-mode": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-width=\"4\"><path d=\"m24.003 4l5.27 5.27h9.457v9.456l5.27 5.27l-5.27 5.278v9.456h-9.456L24.004 44l-5.278-5.27H9.27v-9.456L4 23.997l5.27-5.27V9.27h9.456z\"/><path d=\"M27 17c0 8-5 9-10 9c0 4 6.5 8 12 4s2-13-2-13\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:sun-one": {
    "body": "<g fill=\"none\"><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M24 37c7.18 0 13-5.82 13-13s-5.82-13-13-13s-13 5.82-13 13s5.82 13 13 13Z\"/><path fill=\"currentColor\" d=\"M24 6a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m14.5 6a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m6 14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m-6 14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5M24 47a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5M9.5 41a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m-6-14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m6-14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:sun": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\"><path stroke-linecap=\"round\" d=\"m9.15 9.15l2.228 2.228M3 24h3.15m3 14.85l2.228-2.228M38.85 38.85l-2.228-2.228M45 24h-3.15m-3-14.85l-2.228 2.228M24 3v3.15\"/><path fill=\"currentColor\" d=\"M24 36c6.627 0 12-5.373 12-12s-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12Z\"/><path stroke-linecap=\"round\" d=\"M24 45v-3.15\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:moon": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M28.053 4.41c-5.47 1.427-9.507 6.4-9.507 12.317c0 7.03 5.698 12.728 12.727 12.728c5.916 0 10.89-4.038 12.316-9.508A20 20 0 0 1 44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4c1.389 0 2.744.141 4.053.41Z\"/>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:setting": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\"><path d=\"M36.686 15.171a15.4 15.4 0 0 1 2.529 6.102H44v5.454h-4.785a15.4 15.4 0 0 1-2.529 6.102l3.385 3.385l-3.857 3.857l-3.385-3.385a15.4 15.4 0 0 1-6.102 2.529V44h-5.454v-4.785a15.4 15.4 0 0 1-6.102-2.529l-3.385 3.385l-3.857-3.857l3.385-3.385a15.4 15.4 0 0 1-2.529-6.102H4v-5.454h4.785a15.4 15.4 0 0 1 2.529-6.102l-3.385-3.385l3.857-3.857l3.385 3.385a15.4 15.4 0 0 1 6.102-2.529V4h5.454v4.785a15.4 15.4 0 0 1 6.102 2.529l3.385-3.385l3.857 3.857z\"/><path d=\"M24 29a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:cpu": {
    "body": "<g fill=\"none\"><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M38 8H10a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z\"/><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M30 18H18v12h12z\"/><path d=\"M14.91 2v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M14.91 2v6\"/><path d=\"M14.91 40v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M14.91 40v6\"/><path d=\"M24 2v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M24 2v6\"/><path d=\"M24 40v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M24 40v6\"/><path d=\"M33.09 2v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M33.09 2v6\"/><path d=\"M33.09 40v6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M33.09 40v6\"/><path d=\"M2 14.91h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M2 14.91h6\"/><path d=\"M40 14.91h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M40 14.91h6\"/><path d=\"M2 24h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M2 24h6\"/><path d=\"M40 24h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M40 24h6\"/><path d=\"M2 33.09h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M2 33.09h6\"/><path d=\"M40 33.09h6z\" clip-rule=\"evenodd\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M40 33.09h6\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:application-two": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\"><circle cx=\"34.5\" cy=\"13.5\" r=\"6.5\"/><circle cx=\"34.5\" cy=\"34.5\" r=\"6.5\"/><circle cx=\"13.5\" cy=\"13.5\" r=\"6.5\"/><circle cx=\"13.5\" cy=\"34.5\" r=\"6.5\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:server": {
    "body": "<g fill=\"none\"><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M44 4H4v16h40zm0 24H4v16h40z\"/><path fill=\"currentColor\" d=\"M13 10h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1m0 24h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1m8-24h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1m0 24h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:video-one": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\"><path d=\"M4 10a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v9l8-6v23l-8-6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><circle cx=\"17\" cy=\"21\" r=\"5\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:computer": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 32h10v9H19z\"/><rect width=\"38\" height=\"24\" x=\"5\" y=\"8\" rx=\"2\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M22 27h4M14 41h20\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:code": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"4\"><path stroke-linejoin=\"round\" d=\"M16 13L4 25.432L16 37m16-24l12 12.432L32 37\"/><path d=\"m28 4l-7 40\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:timer": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\"><circle cx=\"24\" cy=\"28\" r=\"16\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M28 4h-8m4 0v8m11 4l3-3M24 28v-6m0 6h-6\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:time": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\"><path d=\"M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z\"/><path stroke-linecap=\"round\" d=\"M24.008 12v12.01l8.479 8.48\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:memory": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\"><path d=\"M8 6v36a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V13.61a2 2 0 0 0-.605-1.433l-7.813-7.61A2 2 0 0 0 30.187 4H10a2 2 0 0 0-2 2Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M40 21H8m32 8H30m10 7H30m0 8V21M18 44V21m0 12H8\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:switch": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M42 19H6M30 7l12 12M6.799 29h36m-36 0l12 12\"/>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:hard-disk": {
    "body": "<g fill=\"none\"><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M44 29H4v13h40z\"/><path fill=\"currentColor\" d=\"M35.5 38a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5\"/><path stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"M4 29L9.038 4.999H39.02l4.98 24\"/></g>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:transfer-data": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\" d=\"m10 8l-6 6l6 6m28 8l6 6l-6 6M4 14h40M4 34h40\"/>",
    "width": 48,
    "height": 48
  },
  "icon-park-outline:dashboard-one": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\"><path d=\"M24.778 7c-11.046 0-20 8.954-20 20c0 5.23 1.713 10.436 5 14h30c3.286-3.564 5-8.77 5-14c0-11.046-8.954-20-20-20\"/><circle cx=\"24.778\" cy=\"30\" r=\"4\"/><path d=\"M24.778 20v6m0-14v2m-15 14h2m2-10l1.414 1.414M37.778 28h2m-5-8.586L36.192 18\"/></g>",
    "width": 49,
    "height": 48
  },
  "tabler:chevron-up": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m6 15l6-6l6 6\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:chevron-down": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m6 9l6 6l6-6\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:chevrons-up": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m7 11l5-5l5 5M7 17l5-5l5 5\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:chevrons-down": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m7 7l5 5l5-5M7 13l5 5l5-5\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:wallet": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M17 8V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6\"/><path d=\"M20 12v4h-4a2 2 0 0 1 0-4z\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:receipt-2": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2l-2 2l-2-2l-2 2l-2-2z\"/><path d=\"M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3H10m2 0v1.5m0-9V8\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:coins": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M9 14c0 1.657 2.686 3 6 3s6-1.343 6-3s-2.686-3-6-3s-6 1.343-6 3\"/><path d=\"M9 14v4c0 1.656 2.686 3 6 3s6-1.344 6-3v-4M3 6c0 1.072 1.144 2.062 3 2.598s4.144.536 6 0S15 7.072 15 6s-1.144-2.062-3-2.598s-4.144-.536-6 0S3 4.928 3 6\"/><path d=\"M3 6v10c0 .888.772 1.45 2 2\"/><path d=\"M3 11c0 .888.772 1.45 2 2\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:cash": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M7 15H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3\"/><path d=\"M7 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z\"/><path d=\"M12 14a2 2 0 1 0 4 0a2 2 0 0 0-4 0\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:server-2": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm0 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm4-7v.01M7 16v.01M11 8h6m-6 8h6\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:download": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:world-pin": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M20.972 11.291a9 9 0 1 0-8.322 9.686M3.6 9h16.8M3.6 15h8.9\"/><path d=\"M11.5 3a17 17 0 0 0 0 18m1-18a17 17 0 0 1 2.578 9.018m6.043 8.103a3 3 0 1 0-4.242 0Q17.506 20.749 19 22q1.577-1.335 2.121-1.879M19 18v.01\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:device-desktop": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm4 15h10m-8-4v4m6-4v4\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:brand-socket-io": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0\"/><path d=\"M11 11h1l3-4zm1 2h1l-4 4z\"/></g>",
    "width": 24,
    "height": 24
  },
  "tabler:browser": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 8h16M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm4-2v4\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:building-skyscraper": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 21h18M5 21V7l8-4v18m6 0V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:clock-hour-4": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0m9 0l3 2m-3-7v5\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:layout-grid": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:table": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 5h18M10 3v18\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:search": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:calendar-dollar": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3m-4-7v4M8 3v4m-4 4h12.5m4.5 4h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3H17m2 0v1m0-8v1\"/>",
    "width": 24,
    "height": 24
  },
  "tabler:arrow-left": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 12h14M5 12l6 6m-6-6l6-6\"/>",
    "width": 24,
    "height": 24
  },
  "lucide:x": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M18 6L6 18M6 6l12 12\"/>",
    "width": 24,
    "height": 24
  },
  "lucide:circle-check": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9l-5.5 5.5L8 12\"/></g>",
    "width": 24,
    "height": 24
  },
  "lucide:info": {
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4m0-4h.01\"/></g>",
    "width": 24,
    "height": 24
  },
  "lucide:triangle-alert": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01\"/>",
    "width": 24,
    "height": 24
  },
  "lucide:octagon-x": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m15 9l-6 6m-6.414 1.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586zM9 9l6 6\"/>",
    "width": 24,
    "height": 24
  },
  "lucide:loader-2": {
    "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 12a9 9 0 1 1-6.219-8.56\"/>",
    "width": 24,
    "height": 24
  },
  "carbon:information": {
    "body": "<path fill=\"currentColor\" d=\"M17 22v-8h-4v2h2v6h-3v2h8v-2zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8\"/><path fill=\"currentColor\" d=\"M16 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4\"/>",
    "width": 32,
    "height": 32
  }
}

export function setupIconify(): void {
  for (const [name, data] of Object.entries(icons)) {
    addIcon(name, data)
  }
}
