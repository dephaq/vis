export type ReferenceImage = {
  filename: string;
  mimeType: string;
  bytes: Buffer;
};

export type ImageGenerationRequest = {
  prompt: string;
  projectId: string;
  jobId: string;
  referenceImages: ReferenceImage[];
};

export type ImageGenerationResult = {
  bytes: Buffer;
  mimeType: string;
  metadata: Record<string, unknown>;
};

export interface ImageProvider {
  name: "mock" | "nano_banana";
  model: string;
  generate(input: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
