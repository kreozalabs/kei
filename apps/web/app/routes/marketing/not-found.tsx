import { ErrorPage } from "@/components/ErrorPage";

export default function MarketingNotFound() {
  return (
    <ErrorPage 
      status={404} 
      homeLink="/" 
      homeLabel="Return Home" 
    />
  );
}
