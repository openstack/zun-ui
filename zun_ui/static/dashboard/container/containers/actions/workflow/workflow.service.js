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
    "horizon.app.core.openstack-service-api.security-group",
    'horizon.app.core.openstack-service-api.zun',
    "horizon.dashboard.container.basePath",
    "horizon.framework.util.i18n.gettext",
    'horizon.framework.util.q.extensions',
    "horizon.framework.widgets.metadata.tree.service"
  ];

  function workflow(
    cinder, neutron, securityGroup, zun, basePath, gettext,
    $qExtensions, treeService
  ) {
    var workflow = {
      init: init
    };

    function init(action, title, submitText, id) {
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
      var exitPolicies = [
        {value: "", name: gettext("Select policy.")},
        {value: "no", name: gettext("No")},
        {value: "on-failure", name: gettext("Restart on failure")},
        {value: "always", name: gettext("Always restart")},
        {value: "unless-stopped", name: gettext("Restart if stopped")},
        {value: "remove", name: gettext("Remove container")}
      ];
      var availabilityZones = [
        {value: "", name: gettext("Select availability zone.")}
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
          runtime: {
            title: gettext("Runtime"),
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
          disk: {
            title: gettext("Disk"),
            type: "number",
            minimum: 0
          },
          availability_zone: {
            title: gettext("Availability Zone"),
            type: "string"
          },
          exit_policy: {
            title: gettext("Exit Policy"),
            type: "string"
          },
          restart_policy_max_retry: {
            title: gettext("Max Retry"),
            type: "number",
            minimum: 0
          },
          auto_heal: {
            title: gettext("Enable auto heal"),
            type: "boolean"
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
                  htmlClass: "col-xs-6",
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
                      key: "runtime",
                      placeholder: gettext("The runtime to create container with."),
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
                      step: 128,
                      placeholder: gettext("The container memory size in MiB.")
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "disk",
                      step: 1,
                      placeholder: gettext("The disk size in GiB for per container.")
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "availability_zone",
                      readonly: action === "update",
                      type: "select",
                      titleMap: availabilityZones
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-6",
                  items: [
                    {
                      key: "exit_policy",
                      type: "select",
                      readonly: action === "update",
                      titleMap: exitPolicies,
                      onChange: function() {
                        var notOnFailure = model.exit_policy !== "on-failure";
                        if (notOnFailure) {
                          model.restart_policy_max_retry = "";
                        }
                        form[0].tabs[1].items[7].items[0].readonly = notOnFailure;
                        // set auto_remove whether exit_policy is "remove".
                        // if exit_policy is set as "remove", clear restart_policy.
                        // otherwise, set restart_policy as same value as exit_policy.
                        model.auto_remove = (model.exit_policy === "remove");
                        if (model.auto_remove) {
                          model.restart_policy = "";
                        } else {
                          model.restart_policy = model.exit_policy;
                        }
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
                      placeholder: gettext("Retry times for 'Restart on failure' policy."),
                      readonly: true
                    }
                  ]
                },
                {
                  type: "section",
                  htmlClass: "col-xs-12",
                  items: [
                    {
                      key: "auto_heal",
                      readonly: action === "update"
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
              ]
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
        runtime: "",
        cpu: "",
        memory: "",
        disks: "",
        availability_zone: "",
        exit_policy: "",
        restart_policy: "",
        restart_policy_max_retry: "",
        auto_remove: false,
        auto_heal: false,
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

      // networks
      model.availableNetworks = [];
      model.allocatedNetworks = [];

      // available ports
      model.availablePorts = [];

      // security groups
      model.availableSecurityGroups = [];
      model.allocatedSecurityGroups = [];

      // get resources
      getContainer(action, id).then(function () {
        getVolumes();
        getNetworks();
        securityGroup.query().then(onGetSecurityGroups);
        zun.getZunAvailabilityZones().then(onGetZunServices);
      });

      // get container when action equals "update"
      function getContainer (action, id) {
        if (action === 'create') {
          return $qExtensions.booleanAsPromise(true);
        } else {
          return zun.getContainer(id).then(onGetContainer);
        }
      }

      // get container for update
      function onGetContainer(response) {
        model.id = id;
        model.name = response.data.name
          ? response.data.name : "";
        model.image = response.data.image
          ? response.data.image : "";
        model.image_driver = response.data.image_driver
          ? response.data.image_driver : "docker";
        model.image_pull_policy = response.data.image_pull_policy
          ? response.data.image_pull_policy : "";
        model.command = response.data.command
          ? response.data.command : "";
        model.hostname = response.data.hostname
          ? response.data.hostname : "";
        model.runtime = response.data.runtime
          ? response.data.runtime : "";
        model.cpu = response.data.cpu
          ? response.data.cpu : "";
        model.memory = response.data.memory
          ? parseInt(response.data.memory, 10) : "";
        model.restart_policy = response.data.restart_policy.Name
          ? response.data.restart_policy.Name : "";
        model.restart_policy_max_retry = response.data.restart_policy.MaximumRetryCount
          ? parseInt(response.data.restart_policy.MaximumRetryCount, 10) : null;
        if (config.model.auto_remove) {
          config.model.exit_policy = "remove";
        } else {
          config.model.exit_policy = config.model.restart_policy;
        }
        model.allocatedNetworks = getAllocatedNetworks(response.data.addresses);
        model.allocatedSecurityGroups = response.data.security_groups;
        model.workdir = response.data.workdir
          ? response.data.workdir : "";
        model.environment = response.data.environment
          ? hashToString(response.data.environment) : "";
        model.interactive = response.data.interactive
          ? response.data.interactive : false;
        model.auto_remove = response.data.auto_remove
          ? response.data.auto_remove : false;
        model.labels = response.data.labels
          ? hashToString(response.data.labels) : "";
        return response;
      }

      function getAllocatedNetworks(addresses) {
        var allocated = [];
        Object.keys(addresses).forEach(function (id) {
          allocated.push(id);
        });
        return allocated;
      }

      function hashToString(hash) {
        var str = "";
        for (var key in hash) {
          if (hash.hasOwnProperty(key)) {
            if (str.length > 0) {
              str += ",";
            }
            str += key + "=" + hash[key];
          }
        }
        return str;
      }

      // get available cinder volumes
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
      function getNetworks() {
        return neutron.getNetworks().then(onGetNetworks).then(getPorts);
      }

      function onGetNetworks(response) {
        push.apply(model.availableNetworks,
          response.data.items.filter(function(network) {
            return network.subnets.length > 0;
          }));
        // if network in model.allocatedNetworks, push it to mode.network for update
        model.availableNetworks.forEach(function (available) {
          model.allocatedNetworks.forEach(function (allocated) {
            if (available.id === allocated) {
              model.networks.push(available);
            }
          });
        });
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
        return networks;
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

      // get security groups
      function onGetSecurityGroups(response) {
        angular.forEach(response.data.items, function (item) {
          // 'default' is a special security group in neutron. It can not be
          // deleted and is guaranteed to exist. It by default contains all
          // of the rules needed for an instance to reach out to the network
          // so the instance can provision itself.
          if (item.name === 'default' && action === "create") {
            model.security_groups.push(item);
          }
          // if network in model.allocatedSecurityGroups,
          // push it to mode.security_groups for update
          else if (model.allocatedSecurityGroups.includes(item.id)) {
            model.security_groups.push(item);
          }

        });
        push.apply(model.availableSecurityGroups, response.data.items);
        return response;
      }

      // get availability zones from zun services
      function onGetZunServices(response) {
        var azs = [];
        response.data.items.forEach(function (service) {
          azs.push({value: service.availability_zone, name: service.availability_zone});
        });
        push.apply(availabilityZones, azs);
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
