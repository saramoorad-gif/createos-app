import { MediaKitEditor } from "@/components/media-kit/media-kit-editor";

export default function MediaKitPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Media Kit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit your media kit and share it with brands.
        </p>
      </div>
      <MediaKitEditor />
    </div>
  );
}
