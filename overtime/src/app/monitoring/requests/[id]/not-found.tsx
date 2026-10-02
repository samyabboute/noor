import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="surface">
      <EmptyState art="inbox" title="This request doesn’t exist." description="It may have been a draft that was discarded. Your other requests are safe." action={<Button href="/monitoring/requests">All requests</Button>} />
    </div>
  );
}
