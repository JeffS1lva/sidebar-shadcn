// Configuração do CORS para o frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        _ = policy.SetIsOriginAllowed(origin =>
        {
            try
            {
                var uri = new Uri(origin);
                string[] allowedDomains =
                [
                    "polarfix.com.br",
                    "127.0.0.1"
                ];

                // Verifica se o host termina com um dos domínios permitidos
                return allowedDomains.Any(domain =>
                    uri.Host.EndsWith(domain, StringComparison.OrdinalIgnoreCase));
            }
            catch
            {
                return false;
            }
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

<IfModule mod_proxy.c>
    ProxyRequests Off
    ProxyPreserveHost On
    SSLProxyEngine On  # Se for HTTPS para o backend interno

    # Ambiente INTERNO (10.101.200.180)
    ProxyPass /api https://10.101.200.180:7000
    ProxyPassReverse /api https://10.101.200.180:7000

    # OU Ambiente EXTERNO (129.148.37.60) - Descomente apenas um
    ProxyPass /api http://129.148.37.60:7000
    ProxyPassReverse /api http://129.148.37.60:7000

    # Headers para manter o IP original
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Real-IP "%{REMOTE_ADDR}e"
</IfModule>

﻿<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <httpErrors>
      <remove statusCode="400" />
      <error statusCode="400" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\bad_request.html" />
      <remove statusCode="401" />
      <error statusCode="401" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\unauthorized.html" />
      <remove statusCode="403" />
      <error statusCode="403" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\forbidden.html" />
      <remove statusCode="404" />
      <error statusCode="404" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\not_found.html" />
      <remove statusCode="405" />
      <error statusCode="405" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\method_not_allowed.html" />
      <remove statusCode="406" />
      <error statusCode="406" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\not_acceptable.html" />
      <remove statusCode="407" />
      <error statusCode="407" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\proxy_authentication_required.html" />
      <remove statusCode="412" />
      <error statusCode="412" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\precondition_failed.html" />
      <remove statusCode="414" />
      <error statusCode="414" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\request-uri_too_long.html" />
      <remove statusCode="415" />
      <error statusCode="415" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\unsupported_media_type.html" />
      <remove statusCode="500" />
      <error statusCode="500" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\internal_server_error.html" />
      <remove statusCode="501" />
      <error statusCode="501" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\not_implemented.html" />
      <remove statusCode="502" />
      <error statusCode="502" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\bad_gateway.html" />
      <remove statusCode="503" />
      <error statusCode="503" path="D:\Inetpub\vhosts\polarfix.com.br\error_docs\maintenance.html" />
    </httpErrors>
    <tracing>
      <traceFailedRequests>
        <clear />
      </traceFailedRequests>
    </tracing>
  </system.webServer>
  <system.web>
    <compilation tempDirectory="D:\Inetpub\vhosts\polarfix.com.br\tmp" />
  </system.web>
</configuration>



<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    <httpErrors>
      <remove statusCode="404" />
      <error statusCode="404" path="/index.html" responseMode="ExecuteURL" />
    </httpErrors>
  </system.webServer>
  <system.web>
    <compilation tempDirectory="D:\Inetpub\vhosts\polarfix.com.br\tmp" />
  </system.web>
</configuration>