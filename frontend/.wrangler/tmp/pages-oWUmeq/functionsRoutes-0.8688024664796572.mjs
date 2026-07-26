import { onRequest as __api___path___ts_onRequest } from "C:\\BACKUP D PARTISION\\file kerja\\biru-langit\\insight-web\\frontend\\functions\\api\\[[path]].ts"

export const routes = [
    {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  ]