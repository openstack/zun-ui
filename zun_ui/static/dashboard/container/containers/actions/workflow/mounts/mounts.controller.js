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
   * @name horizon.dashboard.container.containers.workflow.mounts
   * @description
   * Controller for the Create Container - Mounts Step.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.workflow.mounts',
      MountsController);

  MountsController.$inject = [
    '$scope',
    'horizon.dashboard.container.containers.workflow.mounts.delete-volume.service',
    'horizon.dashboard.container.containers.workflow.mounts.delete-volume.events'
  ];

  function MountsController($scope, deleteVolumeService, events) {
    var ctrl = this;
    ctrl.id = 0;
    ctrl.initModel = {
      type: "cinder-available",
      source: "",
      size: null,
      destination: ""
    };

    // form for adding volume
    ctrl.model = angular.copy(ctrl.initModel);
    ctrl.types = [
      {value: "cinder-available", label: gettext("Existing Cinder Volume")},
      {value: "cinder-new", label: gettext("New Cinder Volume")}
    ];
    ctrl.availableCinderVolumes = $scope.model.availableCinderVolumes;

    // add volume to table
    ctrl.addVolume = function(event) {
      var model = angular.copy(ctrl.model);
      ctrl.id++;
      model.id = ctrl.id;
      if (model.type === "cinder-available") {
        model.size = null;
      } else if (model.type === "cinder-new") {
        model.source = "";
      }
      $scope.model.mounts.push(model);

      // maintain available cinder volume array
      $scope.model.availableCinderVolumes.forEach(function (volume) {
        if (model.type === "cinder-available" && volume.id === model.source) {
          // mark selected volume
          volume.selected = true;
          // add selected volume name on table
          $scope.model.mounts.forEach(function (allocated) {
            if (allocated.source === volume.id) {
              allocated.name = volume.name;
            }
          });
        }
      });
      // clean up form
      ctrl.model = angular.copy(ctrl.initModel);
      event.stopPropagation();
      event.preventDefault();
    };

    // register watcher for volume deletion from table
    var deleteWatcher = $scope.$on(events.DELETE_SUCCESS, deleteVolume);
    $scope.$on('$destroy', function destroy() {
      deleteWatcher();
    });

    // on delete volume from table
    function deleteVolume(event, deleted) {
      // delete volume from table
      ctrl.items.forEach(function (volume, index) {
        if (volume.id === deleted.id) {
          delete ctrl.items.splice(index, 1);
        }
      });
      // enable deleted volume in source selection
      $scope.model.availableCinderVolumes.forEach(function (volume) {
        if (volume.id === deleted.source) {
          // mark not selected volume
          volume.selected = false;
        }
      });
    }

    // settings for table of added volumes
    ctrl.items = $scope.model.mounts;
    ctrl.config = {
      selectAll: false,
      expand: false,
      trackId: 'id',
      columns: [
        {id: 'type', title: gettext('Type')},
        {id: 'source', title: gettext('Source'), filters: ['noValue']},
        {id: 'name', title: gettext('Name'), filters: ['noValue']},
        {id: 'size', title: gettext('Size (GB)'), filters: ['noValue']},
        {id: 'destination', title: gettext('Destination')}
      ]
    };
    ctrl.itemActions = [
      {
        id: 'deleteVolumeAction',
        service: deleteVolumeService,
        template: {
          type: "delete",
          text: gettext("Delete")
        }
      }
    ];
    ctrl.validateVolume = function () {
      return !((ctrl.model.type === "cinder-available" && ctrl.model.source) ||
               (ctrl.model.type === "cinder-new" && ctrl.model.size)) ||
             !ctrl.model.destination;
    };
  }
})();
