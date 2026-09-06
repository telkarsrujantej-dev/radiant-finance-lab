import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Users, ArrowUpDown, Shield } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers, type Member } from "@/lib/members.functions";

type SortKey = "email" | "createdAt" | "lastSignInAt" | "provider";
type SortDir = "asc" | "desc";

const title = "Members — Finance Tracker";
const description = "View every registered member of your Finance Tracker workspace.";

export const Route = createFileRoute("/_authenticated/_admin/members")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembersPage,
});

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MembersPage() {
  const fetchMembers = useServerFn(listMembers);
  const [members, setMembers] = useState<Member[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "createdAt",
    dir: "desc",
  });

  useEffect(() => {
    let active = true;
    fetchMembers()
      .then(({ members: data, count: total }) => {
        if (!active) return;
        setMembers(data);
        setCount(total);
      })
      .catch((error: unknown) => {
        console.error("Failed to load members", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchMembers]);

  const sorted = useMemo(() => {
    const list = [...members];
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "email":
          return dir * ((a.email ?? "").localeCompare(b.email ?? ""));
        case "provider":
          return dir * ((a.provider ?? "").localeCompare(b.provider ?? ""));
        case "createdAt": {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dir * (aTime - bTime);
        }
        case "lastSignInAt": {
          const aTime = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
          const bTime = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
          return dir * (aTime - bTime);
        }
        default:
          return 0;
      }
    });
    return list;
  }, [members, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === "desc" ? "asc" : "desc",
    }));
  };

  const SortButton = ({ column, children }: { column: SortKey; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 px-2 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => toggleSort(column)}
    >
      {children}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  );

  return (
    <PageShell
      title="Members"
      subtitle="Admin"
      actions={
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Owner access
        </div>
      }
    >
      <Card className="rounded-2xl border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
            <Users className="h-5 w-5 text-primary" />
            Total members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <p className="font-display text-4xl font-semibold tracking-tight">{count}</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg font-semibold">Registered users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton column="email">Email</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="provider">Provider</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="createdAt">Joined</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="lastSignInAt">Last sign in</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email ?? "—"}</TableCell>
                    <TableCell className="capitalize">{member.provider ?? "—"}</TableCell>
                    <TableCell>{formatTimestamp(member.createdAt)}</TableCell>
                    <TableCell>{formatTimestamp(member.lastSignInAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
