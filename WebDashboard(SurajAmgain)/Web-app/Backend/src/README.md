
| Folder          | Purpose                                   | Examples                              |
| --------------- | ----------------------------------------- | ------------------------------------- |
| `core/`         | Shared internal infra modules             | `auth/`, `redis/`, `logger/`          |
| `common/`       | Lightweight utils shared across modules   | `pipes/`, `decorators/`, `types/`     |
| `integrations/` | API clients for external/internal systems | `stripe/`, `paytech/`, `aws/` ``       |
| `modules/`      | Core business features/modules            | `account/`, `payee/`, `transaction/`  |
| `commands/`     | One-off or repeated jobs                  | `process-transactions.command.ts`     |
| `events/`       | Event-based architecture logic            | `account-updated/`, `payment-failed/` |





| Type         | Convention                    | Example                       |
|--------------|-------------------------------|-------------------------------|
| Domain Folder| Singular                      | payee/, account/              |
| Reusable Code| Plural                        | pipes/, utils/                |
| Service      | [name].service.ts             | user.service.ts              |
| Module       | [name].module.ts              | auth.module.ts                |
| DTO          | [action]-[entity].dto.ts      | create-user.dto.ts           |
| Client       | [provider]-[entity].client.ts | stripe-payment.client.ts      |
| Guard/Pipe   | [name].guard.ts / .pipe.ts    | jwt.guard.ts                  |


# File Placement Decision Tree

DTO? -> modules/[feature]/dto/

Decorator or utilit?
* Module-specific? -> modules/[feature]/utils/
* Global/shared? ->common/utils/

Auth/redis config? -> core/

External service wrapper? ->integrations/

CLI job? -> commands/