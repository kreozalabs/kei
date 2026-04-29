import { ErrorPage } from "@/components/ErrorPage";

export default function DocsNotFound() {
  return (
    <ErrorPage 
      status={404} 
      homeLink="/docs" 
      homeLabel="Return to Docs" 
    />
  );
}
