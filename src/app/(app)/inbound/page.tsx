import { InboundList } from "@/components/inbound/inbound-list";

export default function InboundPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Inbound</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Work With Me inquiries — review and add to your deal pipeline.
        </p>
      </div>

      <InboundList />
    </div>
  );
}
