import { InboxList } from "@/components/inbox/inbox-list";

export default function InboxPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unified view of Gmail &amp; Outlook — brand deals auto-tagged.
        </p>
      </div>

      <InboxList />
    </div>
  );
}
