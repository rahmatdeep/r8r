import { email, z } from "zod";

export const SignupSchema = z.object({
  email: z.string().min(5),
  password: z.string().min(6),
  name: z.string().min(3),
});

export const SigninSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const WorkflowCreateSchema = z.object({
  availableTriggerId: z.string(),
  title: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
});

export const CredentialCreateSchema = z.object({
  title: z.string(),
  platform: z.enum(["email", "telegram"]),
  keys: z.json(),
});

export const CredentialDeleteSchema = z.object({
  credentialsId: z.string(),
});
