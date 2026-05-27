import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { HomePage } from "@/pages/home";
import { ToolPage } from "@/pages/tool-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
