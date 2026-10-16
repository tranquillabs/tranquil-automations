# tranquil-automations docs

The documentation for automations lives on the Tranquil website, kept in step with the SDK:

- The SDK section: [SDK Overview](https://www.tranquillabs.dev/docs/sdk/) (how a script reaches
  the app and the page), [Tranquil Skill](https://www.tranquillabs.dev/docs/sdk-skill/),
  [Permissions](https://www.tranquillabs.dev/docs/sdk-permissions/),
  [Tranquil API](https://www.tranquillabs.dev/docs/sdk-automation/),
  [Forms API](https://www.tranquillabs.dev/docs/sdk-forms/),
  [Page Code API](https://www.tranquillabs.dev/docs/sdk-page-code/),
  [Custom Parts](https://www.tranquillabs.dev/docs/sdk-custom-parts/),
  [Testing](https://www.tranquillabs.dev/docs/sdk-testing/) and
  [Commands](https://www.tranquillabs.dev/docs/sdk-commands/).
- [Automate with the Tranquil Skill](https://www.tranquillabs.dev/docs/writing-automations/): the
  steps for having your LLM agent write a script while you run and review it.
- [Examples](https://www.tranquillabs.dev/docs/examples/): a page for each script in tranquil-examples.
- [Running Automations](https://www.tranquillabs.dev/docs/running-automations/) and
  [Debug Automations](https://www.tranquillabs.dev/docs/debugging/).
- Decisions: [ADR-0022](https://www.tranquillabs.dev/docs/adr-0022-deno-automation-runner/) (the
  Deno runner) and [ADR-0026](https://www.tranquillabs.dev/docs/adr-0026-form-filling-sdk/) (the
  form-filling SDK and its guard rails).

The Tranquil Skill, the rules for LLM agents writing automations, is not in this repo. It lives
in tranquil-llm (`users/writing-automations.md`), which Tranquil publishes to `~/.tranquil/llm/`
and every automation's first line points to. A change to the SDK's exports, error codes or options updates
that guide in the same change; its test in tranquil-llm checks the guide against this SDK.
