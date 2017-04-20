/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.ConsoleController', controller);

  controller.$inject = [
    '$scope',
    'horizon.dashboard.container.webRoot'
  ];

  function controller(
    $scope, webRoot
  ) {
    var ctrl = this;
    ctrl.container = {};
    ctrl.console_url = "";

    $scope.context.loadPromise.then(onGetContainer);

    function onGetContainer(container) {
      ctrl.container = container.data;
      var consoleUrl = webRoot + "containers/" + ctrl.container.id + "/console";
      var console = $("<p>To display console, interactive mode needs to be enabled " +
        "when this container was created.</p>");
      if (ctrl.container.status !== "Running") {
        console = $("<p>Container is not running.</p>");
      } else if (ctrl.container.interactive) {
        console = $("<iframe id=\"console_embed\" src=\"" + consoleUrl +
        "\" style=\"width:100%;height:100%\"></iframe>");
      }
      $("#console").append(console);
    }
  }
})();
