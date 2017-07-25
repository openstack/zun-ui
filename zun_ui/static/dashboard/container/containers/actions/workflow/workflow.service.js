/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  "use strict";

  angular
    .module("horizon.dashboard.container.containers")
    .factory("horizon.dashboard.container.containers.workflow", workflow);

  workflow.$inject = [
    "horizon.dashboard.container.basePath",
    "horizon.framework.util.i18n.gettext"
  ];

  function workflow(basePath, gettext) {
    var workflow = {
      init: init
    };

    function init(action, title, submitText) {
      var schema, form, model;
      var imageDrivers = [
        {value: "docker", name: gettext("Docker Hub")},
        {value: "glance", name: gettext("Glance")}
      ];
      var imagePullPolicies = [
        {value: "", name: gettext("Select policy.")},
        {value: "ifnotpresent", name: gettext("If not present")},
        {value: "always", name: gettext("Always")},
        {value: "never", name: gettext("Never")}
      ];
      var restartPolicies = [
        {value: "", name: gettext("Select policy.")},
        {value: "no", name: gettext("No")},
        {value: "on-failure", name: gettext("On failure")},
        {value: "always", name: gettext("Always")},
        {value: "unless-stopped", name: gettext("Unless Stopped")}
      ];

      // schema
      schema = {
        type: "object",
        properties: {
          // info
          name: {
            title: gettext("Name"),
            type: "string"
          },
          image: {
            title: gettext("Image"),
            type: "string"
          },
          image_driver: {
            title: gettext("Image Driver"),
            type: "string"
          },
          image_pull_policy: {
            title: gettext("Image Pull Policy"),
            type: "string"
          },
          command: {
            title: gettext("Command"),
            type: "string"
          },
          run: {
            title: gettext("Start container after creation"),
            type: "boolean"
          },
          // spec
          cpu: {
            title: gettext("CPU"),
            type: "number",
            minimum: 0
          },
          memory: {
            title: gettext("Memory"),
            type: "number",
            minimum: 4
          },
          restart_policy: {
            title: gettext("Restart Policy"),
            type: "string"
          },
          restart_policy_max_retry: {
            title: gettext("Max Retry"),
            type: "number",
            minimum: 0
          },
          // misc
          workdir: {
            title: gettext("Working Directory"),
            type: "string"
          },
          environment: {
            title: gettext("Environment Variables"),
            type: "string"
          },
          interactive: {
            title: gettext("Enable interactive mode"),
            type: "boolean"
          },
          // labels
          labels: {
            title: gettext("Labels"),
            type: "string"
          }
        }
      };
      // form
      form = [
        {
          type: "tabs",
          tabs: [
            {
              title: gettext("Info"),
              help: basePath + "containers/actions/workflow/info.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "name",
                      placeholder: gettext("Name of the container to create.")
                    },
                    {
                      key: "image",
                      placeholder: gettext("Name or ID of the container image."),
                      readonly: action === "update",
                      required: true
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "image_driver",
                      readonly: action === "update",
                      type: "select",
                      titleMap: imageDrivers
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "image_pull_policy",
                      type: "select",
                      readonly: action === "update",
                      titleMap: imagePullPolicies
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "command",
                      placeholder: gettext("A command that will be sent to the container."),
                      readonly: action === "update"
                    },
                    {
                      key: "run",
                      readonly: action === "update",
                      condition: action === "update"
                    }
                  ]
                }
              ]
            },
            {
              title: gettext("Spec"),
              help: basePath + "containers/actions/workflow/spec.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "cpu",
                      step: 0.1,
                      placeholder: gettext("The number of virtual cpu for this container.")
                    },
                    {
                      key: "memory",
                      placeholder: gettext("The container memory size in MiB.")
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "restart_policy",
                      type: "select",
                      readonly: action === "update",
                      titleMap: restartPolicies,
                      onChange: function() {
                        var readonly = model.restart_policy !== "on-failure";
                        if (readonly) {
                          model.restart_policy_max_retry = "";
                        }
                        form[0].tabs[1].items[2].items[0].readonly = readonly;
                      }
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "restart_policy_max_retry",
                      placeholder: gettext("Retry times for 'On failure' policy."),
                      readonly: true
                    }
                  ]
                }
              ]
            },
            {
              "title": gettext("Security Groups"),
              /* eslint-disable max-len */
              help: basePath + "containers/actions/workflow/security-groups/security-groups.help.html",
              /* eslint-disable max-len */
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      type: "template",
                      /* eslint-disable max-len */
                      templateUrl: basePath + "containers/actions/workflow/security-groups/security-groups.html"
                      /* eslint-disable max-len */
                    }
                  ]
                }
              ],
              condition: action === "update"
            },
            {
              "title": gettext("Miscellaneous"),
              help: basePath + "containers/actions/workflow/misc.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "workdir",
                      placeholder: gettext("The working directory for commands to run in."),
                      readonly: action === "update"
                    },
                    {
                      key: "environment",
                      placeholder: gettext("KEY1=VALUE1,KEY2=VALUE2..."),
                      readonly: action === "update"
                    },
                    {
                      key: "interactive",
                      readonly: action === "update"
                    }
                  ]
                }
              ]
            },
            {
              title: gettext("Labels"),
              help: basePath + "containers/actions/workflow/labels.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "labels",
                      placeholder: gettext("KEY1=VALUE1,KEY2=VALUE2..."),
                      readonly: action === "update"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      // model
      model = {
        // info
        name: "",
        image: "",
        image_driver: "docker",
        image_pull_policy: "",
        command: "",
        run: true,
        // spec
        cpu: "",
        memory: "",
        restart_policy: "",
        restart_policy_max_retry: "",
        // security groups
        security_groups: [],
        // misc
        workdir: "",
        environment: "",
        interactive: true,
        // labels
        labels: ""
      };

      var config = {
        title: title,
        submitText: submitText,
        schema: schema,
        form: form,
        model: model
      };

      return config;
    }

    return workflow;
  }
})();
