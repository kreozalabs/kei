import { ErrorPage } from "@/components/ErrorPage";

export default function AppNotFound() {
  return (
    <ErrorPage 
      status={404} 
      homeLink="/app" 
      homeLabel="Return to Dashboard" 
    />
  );
}
