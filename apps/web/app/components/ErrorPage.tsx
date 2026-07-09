import { Link, useNavigate } from "react-router";
import { Button } from "@kreozalabs/kei-ui";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 flex min-h-[50vh] flex-col items-center justify-center px-4 text-center duration-700">
      <div className="bg-muted/50 mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl">
        {is404 ? (
          <AlertCircle className="text-muted-foreground size-10" />
        ) : (
          <AlertCircle className="text-destructive/80 size-10" />
        )}
      </div>

      <div className="mx-auto max-w-sm space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          {is404 ? "The path is unclear" : title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {is404
            ? "We couldn't find the page you're looking for. Let's get you back on track."
            : message}
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground flex h-11 flex-row items-center gap-2 rounded-xl px-8 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Link to={homeLink}>
            <Home className="size-4" />
            <span>{homeLabel}</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-muted-foreground hover:text-foreground flex h-11 flex-row items-center gap-2 rounded-xl px-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-4" />
          <span>Go Back</span>
        </Button>
      </div>
    </div>
  );
}
