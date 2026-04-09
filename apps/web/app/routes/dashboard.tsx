import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, initDb } from "../db";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Alert,
  AlertTitle,
} from "@kreozalabs/ui";
import {
  PlusIcon,
  HistoryIcon,
  DatabaseIcon,
  MoreVerticalIcon,
  Trash2Icon,
  RocketIcon,
  SearchIcon,
  Settings2Icon,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

interface Transition {
  id: number;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDbReady, setIsDbReady] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const onBack = () => {
    navigate("/");
  };

  useEffect(() => {
    initDb().then(() => setIsDbReady(true));
  }, []);

  const { data: transitions, isLoading } = useQuery<Transition[]>({
    queryKey: ["transitions"],
    queryFn: async () => {
      const res = await db.query("SELECT * FROM transition_logic ORDER BY created_at DESC");
      return res.rows as Transition[];
    },
    enabled: isDbReady,
  });

  const addTransition = useMutation({
    mutationFn: async (name: string) => {
      await db.query("INSERT INTO transition_logic (name) VALUES ($1)", [name]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transitions"] });
      setIsAddDialogOpen(false);
      setNewName("");
    },
  });

  const deleteTransition = useMutation({
    mutationFn: async (id: number) => {
      await db.query("DELETE FROM transition_logic WHERE id = $1", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transitions"] });
    },
  });

  const filteredTransitions = transitions?.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--color-primary-soft),transparent_50%)] bg-no-repeat bg-fixed selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <RocketIcon className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Kei <span className="text-primary/70">OS</span>
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search transitions..."
                className="pl-10 h-10 bg-muted/40 border-none focus:bg-background transition-all"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground rounded-full hover:bg-muted transition-all"
            >
              <SiGithub className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground rounded-full hover:bg-muted transition-all"
            >
              <Settings2Icon className="size-[1.2rem]" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-12 px-4 sm:px-8">
        {/* Hero Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
              Development <span className="text-primary italic">Sandbox</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Real-time state and transition management powered by{" "}
              <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-4">
                PGlite WASM
              </span>
              .
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="shadow-xl shadow-primary/20 gap-2 h-12 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="size-5" />
                New Transition
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Transition</DialogTitle>
                <DialogDescription>
                  Enter a name for the new transition logic step.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (newName.trim()) addTransition.mutate(newName);
                }}
              >
                <div className="space-y-6 pt-2 pb-6">
                  <div className="space-y-4">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold tracking-wide uppercase opacity-70"
                    >
                      Step Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Initialize Workspace"
                      className="h-12 px-4 bg-muted/20 border-border/50 focus:bg-background transition-all"
                      value={newName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewName(e.target.value)
                      }
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addTransition.isPending}>
                    {addTransition.isPending ? "Configuring..." : "Confirm Deployment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Alert */}
        {!isDbReady && (
          <Alert variant="default" className="mb-8 border-primary/20 bg-primary/5 animate-pulse">
            <DatabaseIcon className="size-4" />
            <AlertTitle>Spinning up Local Postgres Instance...</AlertTitle>
          </Alert>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary/80">
                <HistoryIcon className="size-4" />
                Transition History
              </h3>
              {filteredTransitions && (
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground border">
                  {filteredTransitions.length} ENTRIES
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-24 bg-muted/20 border border-dashed rounded-3xl gap-4">
                <div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Synchronizing with PGlite...
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTransitions?.map((t) => (
                  <Card
                    key={t.id}
                    className="group border-none bg-background/50 hover:bg-background backdrop-blur-sm shadow-xs hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ring-1 ring-border/50"
                  >
                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {t.id}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold transition-colors group-hover:text-primary">
                            {t.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {new Date(t.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate Node</DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => deleteTransition.mutate(t.id)}
                            className="text-destructive font-medium"
                          >
                            <Trash2Icon className="mr-2 size-4" />
                            Purge Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                  </Card>
                ))}

                {filteredTransitions?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-24 bg-muted/10 border-2 border-dashed border-border rounded-3xl text-center">
                    <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <HistoryIcon className="size-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-lg font-semibold text-muted-foreground">No records found</p>
                    <p className="text-sm text-muted-foreground/60 max-w-xs mt-1">
                      {searchTerm
                        ? `No results for "${searchTerm}". Try a different query.`
                        : "Start by creating your first transition logic step below."}
                    </p>
                    {!searchTerm && (
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Create First Node
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl shadow-primary/5 bg-background/50 backdrop-blur-sm ring-1 ring-border/50">
              <div className="h-2 bg-primary/20" />
              <CardHeader>
                <CardTitle className="text-lg">System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium uppercase text-muted-foreground tracking-wider">
                    <span>Database Health</span>
                    <span className="text-secondary">Nominal</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[96%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium uppercase text-muted-foreground tracking-wider">
                    <span>Transition Load</span>
                    <span className="text-accent">Low</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[32%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 shadow-none">
              <CardContent className="p-6">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <RocketIcon className="size-4" />
                  Quick Tips
                </h4>
                <p className="text-sm text-primary/70 leading-relaxed">
                  Use the <strong>Purge Entry</strong> action to permanently remove a logic node
                  from the local PGlite instance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            © 2026 KREOZALABS // EXPERIMENTAL OS 0.11.7
          </p>
        </div>
      </footer>
    </div>
  );
}
