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
   * @name horizon.dashboard.container.containers
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the container
   * panel
   */
  angular
    .module('horizon.dashboard.container.containers', [
      'ngRoute',
      'horizon.dashboard.container.containers.actions',
      'horizon.dashboard.container.containers.details'
    ])
    .constant('horizon.dashboard.container.containers.events', events())
    .constant('horizon.dashboard.container.containers.resourceType', 'OS::Zun::Container')
    .run(run)
    .config(config);

  /**
   * @ngdoc constant
   * @name horizon.dashboard.container.containers.events
   * @description A list of events used by Container
   * @returns {Object} Event constants
   */
  function events() {
    return {
      CREATE_SUCCESS: 'horizon.dashboard.container.containers.CREATE_SUCCESS',
      DELETE_SUCCESS: 'horizon.dashboard.container.containers.DELETE_SUCCESS'
    };
  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.basePath',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.service'
  ];

  function run(registry, zun, basePath, resourceType, containerService) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Container'), gettext('Containers'))
    // for detail summary view on table row.
    .setSummaryTemplateUrl(basePath + 'details/drawer.html')
    // for table row items and detail summary view.
    .setProperties(containerProperties())
    .setListFunction(containerService.getContainersPromise)
    .tableColumns
    .append({
      id: 'name',
      priority: 1,
      sortDefault: true,
      filters: ['noName'],
      urlFunction: containerService.getDetailsPath
    })
    .append({
      id: 'id',
      priority: 3
    })
    .append({
      id: 'image',
      priority: 2
    })
    .append({
      id: 'status',
      priority: 2
    })
    .append({
      id: 'task_state',
      priority: 2
    });
    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Name'),
      'name': 'name',
      'singleton': true
    })
    .append({
      'label': gettext('ID'),
      'name': 'id',
      'singleton': true
    })
    .append({
      'label': gettext('Image'),
      'name': 'image',
      'singleton': true
    })
    .append({
      'label': gettext('Status'),
      'name': 'status',
      'singleton': true
    })
    .append({
      'label': gettext('Task State'),
      'name': 'task_state',
      'singleton': true
    });
  }

  function containerProperties() {
    return {
      'addresses': { label: gettext('Addresses'), filters: ['noValue', 'json'] },
      'command': { label: gettext('Command'), filters: ['noValue'] },
      'cpu': { label: gettext('CPU'), filters: ['noValue'] },
      'environment': { label: gettext('Environment'), filters: ['noValue', 'json'] },
      'host': { label: gettext('Host'), filters: ['noValue'] },
      'hostname': { label: gettext('Hostname'), filters: ['noValue'] },
      'id': {label: gettext('ID'), filters: ['noValue'] },
      'image': {label: gettext('Image'), filters: ['noValue'] },
      'image_driver': {label: gettext('Image Driver'), filters: ['noValue'] },
      'image_pull_policy': {label: gettext('Image Pull Policy'), filters: ['noValue'] },
      'labels': {label: gettext('Labels'), filters: ['noValue', 'json'] },
      'links': {label: gettext('Links'), filters: ['noValue', 'json'] },
      'memory': {label: gettext('Memory'), filters: ['noValue'] },
      'name': {label: gettext('Name'), filters: ['noName'] },
      'ports': {label: gettext('Ports'), filters: ['noValue', 'json'] },
      'security_groups': {label: gettext('Security Groups'), filters: ['noValue', 'json'] },
      'restart_policy': {label: gettext('Restart Policy'), filters: ['noValue', 'json'] },
      'status': {label: gettext('Status'), filters: ['noValue'] },
      'status_detail': {label: gettext('Status Detail'), filters: ['noValue'] },
      'status_reason': {label: gettext('Status Reason'), filters: ['noValue'] },
      'interactive': {label: gettext('Interactive'), filters: ['yesno'] },
      'task_state': {label: gettext('Task State'), filters: ['noValue'] },
      'workdir': {label: gettext('Workdir'), filters: ['noValue'] }
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
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/containers/';
    $provide.constant('horizon.dashboard.container.containers.basePath', path);
    $routeProvider.when('/project/container/containers', {
      templateUrl: path + 'panel.html'
    });
  }
})();
