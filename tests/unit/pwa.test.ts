import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("has installable app metadata and PNG icons", () => {
    const data = manifest();

    expect(data.name).toBe("Interior Visualization");
    expect(data.short_name).toBe("Viz MVP");
    expect(data.start_url).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }),
        expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }),
      ]),
    );
  });
});
