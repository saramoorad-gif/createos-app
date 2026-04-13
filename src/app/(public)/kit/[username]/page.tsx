"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mediaKitData,
  platformStats,
  currentUser,
  totalFollowers,
} from "@/lib/placeholder-data";
import {
  Users,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function InquiryForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif font-semibold text-center">
        Work with {currentUser.full_name.split(" ")[0]}
      </h3>
      <p className="text-sm text-muted-foreground text-center">
        Fill out this form and Brianna will get back to you within 24 hours.
      </p>

      <div>
        <label className="text-sm font-medium block mb-1.5">Your Name</label>
        <input
          type="text"
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Brand / Company</label>
        <input
          type="text"
          placeholder="Your brand name"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@brand.com"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">Budget Range</label>
          <select className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500">
            <option>Under $1,000</option>
            <option>$1,000 – $2,500</option>
            <option>$2,500 – $5,000</option>
            <option>$5,000+</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Platform</label>
          <select className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500">
            <option>TikTok</option>
            <option>Instagram</option>
            <option>YouTube</option>
            <option>Multiple</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Message</label>
        <textarea
          rows={4}
          placeholder="Tell Brianna about your campaign..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
        />
      </div>

      <Button className="w-full gap-2" onClick={onSubmit}>
        <Send className="h-4 w-4" />
        Send Inquiry
      </Button>
    </div>
  );
}

export default function PublicMediaKitPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="bg-gradient-to-br from-terra-50 to-amber-50 px-8 py-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-terra-100 flex items-center justify-center text-2xl font-serif font-bold text-terra-600">
                BC
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {currentUser.full_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {mediaKitData.bio}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              {mediaKitData.niche_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/80 border border-border px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {Object.entries(platformStats).map(([platform, stats]) => (
              <div key={platform} className="py-5 text-center">
                <p className="text-xs text-muted-foreground capitalize">{platform}</p>
                <p className="text-xl font-serif font-bold mt-1">
                  {(stats.followers / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">{stats.engagementRate}% eng.</p>
              </div>
            ))}
          </div>

          <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-warm-50/50">
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
            <h3 className="text-sm font-semibold mb-3">Content I Create</h3>
            <div className="flex flex-wrap gap-1.5">
              {mediaKitData.content_categories.map((cat) => (
                <Badge key={cat} variant="muted" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>

          {/* Rates */}
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
            <h3 className="text-sm font-semibold mb-3">Brands I&apos;ve Worked With</h3>
            <div className="flex flex-wrap gap-2">
              {mediaKitData.brands_worked_with.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center rounded-lg bg-warm-100 px-3 py-1.5 text-xs font-medium"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* Content Samples */}
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

          {/* CTA / Form */}
          <div className="px-8 py-8">
            {!showForm && !submitted && (
              <div className="text-center">
                <Button size="lg" className="gap-2" onClick={() => setShowForm(true)}>
                  <Sparkles className="h-4 w-4" />
                  Work with me
                </Button>
              </div>
            )}

            {showForm && !submitted && (
              <InquiryForm onSubmit={() => setSubmitted(true)} />
            )}

            {submitted && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold text-foreground">
                  Inquiry sent!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Brianna has been notified and will get back to you within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-serif">
              create<span className="italic text-terra-500 font-semibold">OS</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
