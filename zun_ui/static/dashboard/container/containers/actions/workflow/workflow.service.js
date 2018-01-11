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
    "horizon.app.core.openstack-service-api.cinder",
    "horizon.app.core.openstack-service-api.neutron",
    "horizon.dashboard.container.basePath",
    "horizon.framework.util.i18n.gettext",
    "horizon.framework.widgets.metadata.tree.service"
  ];

  function workflow(cinder, neutron, basePath, gettext, treeService) {
    var workflow = {
      init: init
    };

    function init(action, title, submitText) {
      var push = Array.prototype.push;
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
      var runtimes = [
        {value: "", name: gettext("Select runtime.")},
        {value: "runc", name: gettext("runc")}
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
          hostname: {
            title: gettext("Hostname"),
            type: "string"
          },
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
          destination: {
            title: gettext("Destination"),
            type: "string"
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
          runtime: {
            title: gettext("Runtime"),
            type: "string"
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
          auto_remove: {
            title: gettext("Auto remove"),
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
                      readonly: action === "update"
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
                      key: "hostname",
                      placeholder: gettext("The host name of this container."),
                      readonly: action === "update"
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "cpu",
                      step: 0.1,
                      placeholder: gettext("The number of virtual cpu for this container.")
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
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
                        form[0].tabs[1].items[4].items[0].readonly = readonly;
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
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "runtime",
                      type: "select",
                      readonly: action === "update",
                      titleMap: runtimes
                    }
                  ]
                }
              ]
            },
            {
              "title": gettext("Volumes"),
              help: basePath + "containers/actions/workflow/mounts/mounts.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      type: "template",
                      templateUrl: basePath + "containers/actions/workflow/mounts/mounts.html"
                    }
                  ]
                }
              ],
              condition: action === "update"
            },
            {
              "title": gettext("Networks"),
              help: basePath + "containers/actions/workflow/networks/networks.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      type: "template",
                      templateUrl: basePath + "containers/actions/workflow/networks/networks.html"
                    }
                  ]
                }
              ],
              condition: action === "update"
            },
            {
              "title": gettext("Ports"),
              help: basePath + "containers/actions/workflow/ports/ports.help.html",
              type: "section",
              htmlClass: "row",
              items: [
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      type: "template",
                      templateUrl: basePath + "containers/actions/workflow/ports/ports.html"
                    }
                  ]
                }
              ],
              condition: action === "update"
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
                    },
                    {
                      key: "auto_remove",
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
            },
            {
              "title": gettext("Scheduler Hints"),
              /* eslint-disable max-len */
              help: basePath + "containers/actions/workflow/scheduler-hints/scheduler-hints.help.html",
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
                      templateUrl: basePath + "containers/actions/workflow/scheduler-hints/scheduler-hints.html"
                      /* eslint-disable max-len */
                    }
                  ]
                }
              ],
              condition: action === "update"
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
        hostname: "",
        cpu: "",
        memory: "",
        restart_policy: "",
        restart_policy_max_retry: "",
        runtime: "",
        // mounts
        mounts: [],
        // networks
        networks: [],
        // ports
        ports: [],
        // security groups
        security_groups: [],
        // misc
        workdir: "",
        environment: "",
        interactive: true,
        auto_remove: false,
        // labels
        labels: "",
        // hints
        availableHints: [],
        hintsTree: null,
        hints: {}
      };

      // initialize tree object for scheduler hints.
      model.hintsTree = new treeService.Tree(model.availableHints, {});

      // available cinder volumes
      model.availableCinderVolumes = [
        {id: "", name: gettext("Select available Cinder volume")}
      ];

      // available networks
      model.availableNetworks = [];

      // available ports
      model.availablePorts = [];

      // get available cinder volumes
      getVolumes();
      function getVolumes() {
        return cinder.getVolumes().then(onGetVolumes);
      }

      function onGetVolumes(response) {
        push.apply(model.availableCinderVolumes,
          response.data.items.filter(function(volume) {
            return volume.status === "available";
          }));
        model.availableCinderVolumes.forEach(function(volume) {
          volume.selected = false;
          return volume;
        });
        return response;
      }

      // get available neutron networks and ports
      getNetworks();
      function getNetworks() {
        return neutron.getNetworks().then(onGetNetworks).then(getPorts);
      }

      function onGetNetworks(response) {
        push.apply(model.availableNetworks,
          response.data.items.filter(function(network) {
            return network.subnets.length > 0;
          }));
        return response;
      }

      function getPorts(networks) {
        networks.data.items.forEach(function(network) {
          return neutron.getPorts({network_id: network.id}).then(
            function(ports) {
              onGetPorts(ports, network);
            }
          );
        });
      }

      function onGetPorts(ports, network) {
        ports.data.items.forEach(function(port) {
          // no device_owner means that the port can be attached
          if (port.device_owner === "" && port.admin_state === "UP") {
            port.subnet_names = getPortSubnets(port, network.subnets);
            port.network_name = network.name;
            model.availablePorts.push(port);
          }
        });
      }

      // helper function to return an object of IP:NAME pairs for subnet mapping
      function getPortSubnets(port, subnets) {
        var subnetNames = {};
        port.fixed_ips.forEach(function (ip) {
          subnets.forEach(function (subnet) {
            if (ip.subnet_id === subnet.id) {
              subnetNames[ip.ip_address] = subnet.name;
            }
          });
        });
        return subnetNames;
      }

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
