"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  mediaKitData,
  platformStats,
  currentUser,
  totalFollowers,
} from "@/lib/placeholder-data";
import {
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Eye,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";

function MediaKitPreview({
  bio,
  nicheTags,
  contentCategories,
  brandsWorkedWith,
}: {
  bio: string;
  nicheTags: string[];
  contentCategories: string[];
  brandsWorkedWith: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-terra-50 to-amber-50 px-8 py-8 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="h-16 w-16 rounded-full bg-terra-100 flex items-center justify-center text-xl font-serif font-bold text-terra-600">
            BC
          </div>
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground">
          {currentUser.full_name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{bio}</p>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          {nicheTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/80 border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {Object.entries(platformStats).map(([platform, stats]) => (
          <div key={platform} className="py-4 text-center">
            <p className="text-xs text-muted-foreground capitalize">{platform}</p>
            <p className="text-lg font-serif font-bold mt-0.5">
              {(stats.followers / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-emerald-600">{stats.engagementRate}% eng.</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total Following</span>
        </div>
        <span className="text-lg font-serif font-bold text-terra-600">
          {(totalFollowers / 1000).toFixed(0)}K
        </span>
      </div>

      {/* Content Categories */}
      <div className="px-8 py-5 border-b border-border">
        <h3 className="text-sm font-semibold mb-2">Content I Create</h3>
        <div className="flex flex-wrap gap-1.5">
          {contentCategories.map((cat) => (
            <Badge key={cat} variant="muted" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Rate Ranges */}
      <div className="px-8 py-5 border-b border-border">
        <h3 className="text-sm font-semibold mb-3">Rate Ranges</h3>
        <div className="space-y-2">
          {Object.entries(mediaKitData.rate_ranges).map(([type, range]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">
                {type.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-medium text-terra-600">{range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="px-8 py-5 border-b border-border">
        <h3 className="text-sm font-semibold mb-2">Brands I&apos;ve Worked With</h3>
        <div className="flex flex-wrap gap-2">
          {brandsWorkedWith.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center rounded-lg bg-warm-100 px-3 py-1.5 text-xs font-medium text-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Content Samples placeholder */}
      <div className="px-8 py-5 border-b border-border">
        <h3 className="text-sm font-semibold mb-3">Content Samples</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted flex items-center justify-center"
            >
              <span className="text-xs text-muted-foreground">Sample {i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 py-6 text-center">
        <Button className="gap-2">
          Work with me
        </Button>
      </div>
    </div>
  );
}

export function MediaKitEditor() {
  const [bio, setBio] = useState(mediaKitData.bio);
  const [nicheTags, setNicheTags] = useState(mediaKitData.niche_tags);
  const [contentCategories] = useState(mediaKitData.content_categories);
  const [brandsWorkedWith] = useState(mediaKitData.brands_worked_with);
  const [copied, setCopied] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500";

  return (
    <div className="space-y-4">
      {/* Share Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terra-50">
                <ExternalLink className="h-4 w-4 text-terra-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Public Media Kit</p>
                <code className="text-xs text-muted-foreground">
                  createos.co/kit/briannacole
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Copy link</>
                )}
              </Button>
              <Button size="sm" className="h-8 gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left — Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-terra-500" />
                Edit Media Kit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Bio</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Niche Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {nicheTags.map((tag) => (
                    <Badge key={tag} variant="muted" className="text-xs gap-1">
                      {tag}
                      <button
                        onClick={() => setNicheTags(nicheTags.filter((t) => t !== tag))}
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  className={inputClass}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      setNicheTags([...nicheTags, e.currentTarget.value]);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium block mb-1.5">Platform Stats</label>
                <div className="space-y-2">
                  {Object.entries(platformStats).map(([platform, stats]) => (
                    <div key={platform} className="grid grid-cols-3 gap-2">
                      <span className="text-sm text-muted-foreground capitalize flex items-center">
                        {platform}
                      </span>
                      <input
                        type="number"
                        className={inputClass}
                        defaultValue={stats.followers}
                        placeholder="Followers"
                      />
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        defaultValue={stats.engagementRate}
                        placeholder="Eng %"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium block mb-1.5">Content Categories</label>
                <div className="flex flex-wrap gap-1.5">
                  {contentCategories.map((cat) => (
                    <Badge key={cat} variant="muted" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Brands Worked With</label>
                <div className="flex flex-wrap gap-1.5">
                  {brandsWorkedWith.map((brand) => (
                    <Badge key={brand} variant="muted" className="text-xs">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right — Live Preview */}
        <div>
          <div className="sticky top-20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              Live Preview
            </p>
            <MediaKitPreview
              bio={bio}
              nicheTags={nicheTags}
              contentCategories={contentCategories}
              brandsWorkedWith={brandsWorkedWith}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
