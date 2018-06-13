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
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.dashboard.container.capsules
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the capsules
   * panel
   */
  angular
    .module('horizon.dashboard.container.capsules', [
      'ngRoute',
      'horizon.dashboard.container.capsules.actions',
      'horizon.dashboard.container.capsules.details'
    ])
    .constant('horizon.dashboard.container.capsules.events', events())
    .constant('horizon.dashboard.container.capsules.resourceType', 'OS::Zun::Capsule')
    .run(run)
    .config(config);

  /**
   * @ngdoc constant
   * @name horizon.dashboard.container.capsules.events
   * @description A list of events used by Capsules
   * @returns {Object} Event constants
   */
  function events() {
    return {
      CREATE_SUCCESS: 'horizon.dashboard.container.capsules.CREATE_SUCCESS',
      DELETE_SUCCESS: 'horizon.dashboard.container.capsules.DELETE_SUCCESS'
    };
  }

  run.$inject = [
    '$filter',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.capsules.basePath',
    'horizon.dashboard.container.capsules.resourceType',
    'horizon.dashboard.container.capsules.service'
  ];

  function run($filter, registry, zun, basePath, resourceType, capsuleService) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Capsule'), gettext('Capsules'))
    .setSummaryTemplateUrl(basePath + 'drawer.html')
    .setDefaultIndexUrl('/project/container/capsules/')
    .setProperties(capsuleProperties())
    .setListFunction(capsuleService.getCapsulesPromise)
    .tableColumns
    .append({
      id: 'name',
      priority: 1,
      sortDefault: true,
      urlFunction: capsuleService.getDetailsPath
    })
    .append({
      id: 'id',
      priority: 2
    })
    .append({
      id: 'status',
      priority: 1
    })
    .append({
      id: 'cpu',
      priority: 3
    })
    .append({
      id: 'memory',
      priority: 3
    });
    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Capsule ID'),
      'name': 'capsule_id',
      'singleton': true
    })
    .append({
      'label': gettext('Name'),
      'name': 'name',
      'singleton': true
    })
    .append({
      'label': gettext('Status'),
      'name': 'status',
      'singleton': true
    });
  }

  function capsuleProperties() {
    return {
      'addresses': {label: gettext('Addresses'), filters: ['noValue', 'json'] },
      'capsule_versionid': {label: gettext('Capsule Version ID'), filters: ['noValue'] },
      'containers': {label: gettext('Containers'), filters: ['noValue', 'json'] },
      'container_uuids': {label: gettext('Container UUIDs'), filters: ['noValue', 'json'] },
      'cpu': {label: gettext('CPU'), filters: ['noValue'] },
      'created_at': { label: gettext('Created'), filters: ['simpleDate'] },
      'id': {label: gettext('ID'), filters: ['noValue'] },
      'links': {label: gettext('Links'), filters: ['noValue', 'json'] },
      'memory': { label: gettext('Memory'), filters: ['noValue'] },
      'meta_labels': {label: gettext('Labels'), filters: ['noValue', 'json'] },
      'name': { label: gettext('Name'), filters: ['noName'] },
      'project_id': { label: gettext('Project ID'), filters: ['noValue'] },
      'restart_policy': { label: gettext('Restart Policy'), filters: ['noValue'] },
      'status': { label: gettext('Status'), filters: ['noValue'] },
      'status_reason': { label: gettext('Status Reason'), filters: ['noValue'] },
      'updated_at': { label: gettext('Updated'), filters: ['simpleDate'] },
      'user_id': { label: gettext('User ID'), filters: ['noValue'] },
      'volumes_info': {label: gettext('Volumes Info'), filters: ['noValue', 'json'] }
    };
  }

  config.$inject = [
    '$provide',
    '$windowProvider',
    '$routeProvider'
  ];

  /**
   * @name config
   * @param {Object} $provide
   * @param {Object} $windowProvider
   * @param {Object} $routeProvider
   * @description Routes used by this module.
   * @returns {undefined} Returns nothing
   */
  function config($provide, $windowProvider, $routeProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/capsules/';
    $provide.constant('horizon.dashboard.container.capsules.basePath', path);
    $routeProvider.when('/project/container/capsules', {
      templateUrl: path + 'panel.html'
    });
  }
})();
