import { UserfrontProvider } from "@userfront/react";

function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserfrontProvider tenantId="demo1234">
          {children}
        </UserfrontProvider>
      </body>
    </html>
  );
}