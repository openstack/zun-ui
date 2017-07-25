/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.workflow.security-group',
      SecurityGroupsController);

  SecurityGroupsController.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.security-group',
    'horizon.dashboard.container.basePath'
  ];

  /**
   * @ngdoc controller
   * @name SecurityGroupsController
   * @param {Object} containerModel
   * @param {string} basePath
   * @description
   * Allows selection of security groups.
   * @returns {undefined} No return value
   */
  function SecurityGroupsController($scope, securityGroup, basePath) {
    var push = Array.prototype.push;

    var ctrl = this;
    var availableSecurityGroups = [];
    securityGroup.query().then(onGetSecurityGroups);

    ctrl.tableData = {
      available: availableSecurityGroups,
      allocated: $scope.model.security_groups,
      displayedAvailable: [],
      displayedAllocated: []
    };

    /* eslint-disable max-len */
    ctrl.tableDetails = basePath + 'containers/actions/workflow/security-groups/security-group-details.html';
    /* eslint-enable max-len */

    ctrl.tableHelp = {
      /* eslint-disable max-len */
      noneAllocText: gettext('Select one or more security groups from the available groups below.'),
      /* eslint-enable max-len */
      availHelpText: gettext('Select one or more')
    };

    ctrl.tableLimits = {
      maxAllocation: -1
    };

    ctrl.filterFacets = [
      {
        label: gettext('Name'),
        name: 'name',
        singleton: true
      },
      {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }
    ];

    // Security Groups
    function onGetSecurityGroups(data) {
      angular.forEach(data.data.items, function addDefault(item) {
        // 'default' is a special security group in neutron. It can not be
        // deleted and is guaranteed to exist. It by default contains all
        // of the rules needed for an instance to reach out to the network
        // so the instance can provision itself.
        if (item.name === 'default') {
          $scope.model.security_groups.push(item);
        }
      });
      push.apply(availableSecurityGroups, data.data.items);
    }
  }
})();
