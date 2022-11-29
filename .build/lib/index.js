import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// stacks/MyStack.ts
import { Api, Table } from "@serverless-stack/resources";
function MyStack({ stack }) {
  const table = new Table(stack, "Payments", {
    fields: {
      paymentId: "string",
      status: "string"
    },
    primaryIndex: { partitionKey: "paymentId", sortKey: "status" }
  });
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [table]
      }
    },
    routes: {
      "GET    /payment/all": "functions/payment.main",
      "GET    /check-status": "functions/lambda.main"
    }
  });
  api.attachPermissions([table]);
  stack.addOutputs({
    ApiEndpoint: api.url
  });
}
__name(MyStack, "MyStack");

// stacks/index.ts
function stacks_default(app) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm"
    }
  });
  app.stack(MyStack);
}
__name(stacks_default, "default");
export {
  stacks_default as default
};
//# sourceMappingURL=index.js.map
