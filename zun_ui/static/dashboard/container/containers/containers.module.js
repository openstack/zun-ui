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
    .constant('horizon.dashboard.container.containers.validStates', validStates())
    .constant('horizon.dashboard.container.containers.adminActions', adminActions())
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

  function validStates() {
    var states = {
      ERROR: 'Error', RUNNING: 'Running', STOPPED: 'Stopped',
      PAUSED: 'Paused', UNKNOWN: 'Unknown', CREATING: 'Creating',
      CREATED: 'Created', DELETED: 'Deleted', DELETING: 'Deleting',
      REBUILDING: 'Rebuilding', DEAD: 'Dead', RESTARTING: 'Restarting'
    };
    return {
      update: [states.CREATED, states.RUNNING, states.STOPPED, states.PAUSED],
      start: [states.CREATED, states.STOPPED, states.ERROR],
      stop: [states.RUNNING],
      restart: [states.CREATED, states.RUNNING, states.STOPPED, states.ERROR],
      rebuild: [states.CREATED, states.RUNNING, states.STOPPED, states.ERROR],
      pause: [states.RUNNING],
      unpause: [states.PAUSED],
      execute: [states.RUNNING],
      kill: [states.RUNNING],
      delete: [states.CREATED, states.ERROR, states.STOPPED, states.DELETED, states.DEAD],
      /* NOTE(shu-mutow): Docker does not allow us to delete PAUSED container.
       *                  There are ways to delete paused container in server,
       *                  but we are according to Docker's policy as now.
       */
      delete_force: [
        states.CREATED, states.CREATING, states.ERROR, states.RUNNING,
        states.STOPPED, states.UNKNOWN, states.DELETED, states.DEAD,
        states.RESTARTING, states.REBUILDING, states.DELETING
      ],
      delete_stop: [
        states.RUNNING, states.CREATED, states.ERROR, states.STOPPED,
        states.DELETED, states.DEAD
      ],
      manage_security_groups: [states.CREATED, states.RUNNING, states.STOPPED, states.PAUSED]
    };
  }

  function adminActions() {
    return ["update", "start", "stop", "restart", "rebuild", "kill", "delete_force"];
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
    .setSummaryTemplateUrl(basePath + 'details/drawer.html')
    .setDefaultIndexUrl(containerService.getDefaultIndexUrl())
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
      'auto_heal': { label: gettext('Auto Heal'), filters: ['yesno'] },
      'auto_remove': { label: gettext('Auto Remove'), filters: ['yesno'] },
      'command': { label: gettext('Command'), filters: ['noValue'] },
      'cpu': { label: gettext('CPU'), filters: ['noValue'] },
      'disk': { label: gettext('Disk'), filters: ['gb', 'noValue'] },
      'environment': { label: gettext('Environment'), filters: ['noValue', 'json'] },
      'host': { label: gettext('Host'), filters: ['noValue'] },
      'hostname': { label: gettext('Hostname'), filters: ['noValue'] },
      'id': {label: gettext('ID'), filters: ['noValue'] },
      'image': {label: gettext('Image'), filters: ['noValue'] },
      'image_driver': {label: gettext('Image Driver'), filters: ['noValue'] },
      'image_pull_policy': {label: gettext('Image Pull Policy'), filters: ['noValue'] },
      'interactive': {label: gettext('Interactive'), filters: ['yesno'] },
      'labels': {label: gettext('Labels'), filters: ['noValue', 'json'] },
      'links': {label: gettext('Links'), filters: ['noValue', 'json'] },
      'memory': {label: gettext('Memory'), filters: ['noValue'] },
      'name': {label: gettext('Name'), filters: ['noName'] },
      'ports': {label: gettext('Ports'), filters: ['noValue', 'json'] },
      'restart_policy': {label: gettext('Restart Policy'), filters: ['noValue', 'json'] },
      'runtime': {label: gettext('Runtime'), filters: ['noName'] },
      'security_groups': {label: gettext('Security Groups'), filters: ['noValue', 'json'] },
      'status': {label: gettext('Status'), filters: ['noValue'] },
      'status_detail': {label: gettext('Status Detail'), filters: ['noValue'] },
      'status_reason': {label: gettext('Status Reason'), filters: ['noValue'] },
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
    $routeProvider
      .when('/project/container/containers', {
        templateUrl: path + 'panel.html'
      })
      .when('/admin/container/containers', {
        templateUrl: path + 'panel.html'
      });
  }
})();
