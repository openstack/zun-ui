/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name horizon.dashboard.container.containers.manage-security-groups
   * @description
   * Controller for the Manage Security Groups dialog.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.manage-security-groups',
      ManageSecurityGroupsController);

  ManageSecurityGroupsController.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.neutron',
    'horizon.app.core.openstack-service-api.security-group',
    'horizon.dashboard.container.containers.manage-security-groups.delete.service',
    'horizon.dashboard.container.containers.manage-security-groups.delete.events'
  ];

  function ManageSecurityGroupsController(
    $scope, neutron, securityGroup, deleteSecurityGroupService, events
  ) {
    var ctrl = this;

    // form settings to add association of port and security group into table ///////////
    // model template
    ctrl.modelTemplate = {
      id: "",
      port: "",
      port_name: "",
      security_group: "",
      security_group_name: ""
    };

    // initiate model
    ctrl.model = angular.copy(ctrl.modelTemplate);

    // for port selection
    ctrl.availablePorts = [
      {id: "", name: gettext("Select port.")}
    ];

    // for security group selection
    var message = {
      portNotSelected: gettext("Select port first."),
      portSelected: gettext("Select security group.")
    };
    ctrl.availableSecurityGroups = [
      {id: "", name: message.portNotSelected, selected: false}
    ];
    ctrl.refreshAvailableSecurityGroups = refreshAvailableSecurityGroups;

    // add association into table
    ctrl.addSecurityGroup = function(event) {
      ctrl.model.id = ctrl.model.port + " " + ctrl.model.security_group;
      ctrl.model.port_name = getPortName(ctrl.model.port);
      ctrl.model.security_group_name = getSecurityGroupName(ctrl.model.security_group);
      var model = angular.copy(ctrl.model);
      $scope.model.port_security_groups.push(model);

      // clean up form
      ctrl.model = angular.copy(ctrl.modelTemplate);
      ctrl.disabledSecurityGroup = true;
      event.stopPropagation();
      event.preventDefault();
      refreshAvailableSecurityGroups();
    };

    // get port name from available ports.
    function getPortName(port) {
      var result = "";
      ctrl.availablePorts.forEach(function (ap) {
        if (port === ap.id) {
          result = ap.name;
        }
      });
      return result;
    }

    // get security group name from available security groups.
    function getSecurityGroupName(sg) {
      var result = "";
      ctrl.availableSecurityGroups.forEach(function (asg) {
        if (sg === asg.id) {
          result = asg.name;
        }
      });
      return result;
    }

    // refresh available security group selection, according to addition/deletion of associations.
    ctrl.disabledSecurityGroup = true;
    function refreshAvailableSecurityGroups() {
      if (ctrl.model.port) {
        // if port is selected, enable port selection.
        ctrl.disabledSecurityGroup = false;
      } else {
        // otherwise disable port selection.
        ctrl.disabledSecurityGroup = true;
      }
      // set "selected" to true, if the security group already added into table.
      ctrl.availableSecurityGroups.forEach(function (sg) {
        sg.selected = false;
        ctrl.items.forEach(function (item) {
          if (sg.id === item.security_group && ctrl.model.port === item.port) {
            // mark already selected
            sg.selected = true;
          }
        });
      });
    }

    // enable "Add Security Group" button, if both of port and security group are selected.
    ctrl.validateSecurityGroup = function () {
      return !(ctrl.model.port && ctrl.model.security_group);
    };

    // retrieve available ports and security groups ///////////////////////////
    // get security groups first, then get networks
    securityGroup.query().then(onGetSecurityGroups).then(getNetworks);
    function onGetSecurityGroups(response) {
      angular.forEach(response.data.items, function (item) {
        ctrl.availableSecurityGroups.push({id: item.id, name: item.name, selected: false});
        // if association of port and security group in $scope.model.port_security_groups,
        // push it into table for update.
        if ($scope.model.port_security_groups.includes(item.id)) {
          ctrl.security_groups.push(item);
        }

      });
      return response;
    }

    // get available neutron networks and ports
    function getNetworks() {
      return neutron.getNetworks().then(onGetNetworks).then(getPorts);
    }

    function onGetNetworks(response) {
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
        // no device_owner or compute:kuryr means that the port can be associated
        // with security group
        if ((port.device_owner === "" || port.device_owner === "compute:kuryr") &&
          port.admin_state === "UP") {
          port.subnet_names = getPortSubnets(port, network.subnets);
          port.network_name = network.name;
          if ($scope.model.ports.includes(port.id)) {
            var portName = port.network_name + " - " + port.subnet_names + " - " + port.name;
            ctrl.availablePorts.push({
              id: port.id,
              name: portName});
            port.security_groups.forEach(function (sgId) {
              var sgName;
              ctrl.availableSecurityGroups.forEach(function (sg) {
                if (sgId === sg.id) {
                  sgName = sg.name;
                }
              });
              $scope.model.port_security_groups.push({
                id: port.id + " " + sgId,
                port: port.id,
                port_name: portName,
                security_group: sgId,
                security_group_name: sgName
              });
            });
          }
        }
      });
    }

    // helper function to return an object of IP:NAME pairs for subnet mapping
    function getPortSubnets(port, subnets) {
      //var subnetNames = {};
      var subnetNames = "";
      port.fixed_ips.forEach(function (ip) {
        subnets.forEach(function (subnet) {
          if (ip.subnet_id === subnet.id) {
            //subnetNames[ip.ip_address] = subnet.name;
            if (subnetNames) {
              subnetNames += ", ";
            }
            subnetNames += ip.ip_address + ": " + subnet.name;
          }
        });
      });
      return subnetNames;
    }

    // settings for table of added security groups ////////////////////////////
    ctrl.items = $scope.model.port_security_groups;
    ctrl.config = {
      selectAll: false,
      expand: false,
      trackId: 'id',
      columns: [
        {id: 'port_name', title: gettext('Port')},
        {id: 'security_group_name', title: gettext('Security Group')}
      ]
    };
    ctrl.itemActions = [
      {
        id: 'deleteSecurityGroupAction',
        service: deleteSecurityGroupService,
        template: {
          type: "delete",
          text: gettext("Delete")
        }
      }
    ];

    // register watcher for security group deletion from table
    var deleteWatcher = $scope.$on(events.DELETE_SUCCESS, deleteSecurityGroup);
    $scope.$on('$destroy', function destroy() {
      deleteWatcher();
    });

    // on delete security group from table
    function deleteSecurityGroup(event, deleted) {
      // delete security group from table
      ctrl.items.forEach(function (sg, index) {
        if (sg.id === deleted.port + " " + deleted.security_group) {
          delete ctrl.items.splice(index, 1);
        }
      });
      // enable deleted security group in selection
      refreshAvailableSecurityGroups();
    }
  }
})();
