import { Link, useNavigate } from "react-router";
import { Button } from "@kreozalabs/ui";
import { ChevronLeft, Home, AlertCircle } from "lucide-react";

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
  homeLink?: string;
  homeLabel?: string;
}

export function ErrorPage({
  status = 500,
  title = "Unexpected Error",
  message = "An error occurred while processing your request.",
  homeLink = "/",
  homeLabel = "Return Home",
}: ErrorPageProps) {
  const is404 = status === 404;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-center size-20 rounded-2xl bg-muted/50 mb-8 mx-auto">
        {is404 ? (
          <AlertCircle className="size-10 text-muted-foreground" />
        ) : (
          <AlertCircle className="size-10 text-destructive/80" />
        )}
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        <h2 className="text-2xl font-semibold tracking-tight">
          {is404 ? "The path is unclear" : title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {is404
            ? "We couldn't find the page you're looking for. Let's get you back on track."
            : message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
        <Button
          asChild
          size="lg"
          className="flex flex-row items-center gap-2 rounded-xl px-8 h-11 bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Link to={homeLink}>
            <Home className="size-4" />
            <span>{homeLabel}</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="flex flex-row items-center gap-2 rounded-xl px-6 h-11 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-4" />
          <span>Go Back</span>
        </Button>
      </div>
    </div>
  );
}
