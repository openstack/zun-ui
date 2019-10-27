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
    .module('horizon.cloud-shell')
    .controller('horizon.cloud-shell.controller', cloudShellController);

  cloudShellController.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.webRoot',
    'horizon.framework.util.http.service'
  ];

  function cloudShellController(
    $scope,
    zun,
    webRoot,
    http
  ) {
    var ctrl = this;
    ctrl.openInNewWindow = openInNewWindow;
    ctrl.close = closeShell;
    ctrl.consoleUrl = null;
    ctrl.container = {};
    ctrl.resizeTerminal = resizeTerminal;

    // close existing shell
    closeShell();

    // default size for shell
    var cols = 80;
    var rows = 24;

    // get clouds.yaml for OpenStack Client
    var cloudsYaml;
    http.get('/project/api_access/clouds.yaml/').then(function(response) {
      // cloud.yaml to be set to .config/openstack/clouds.yaml in container
      cloudsYaml = response.data;

      ctrl.user = cloudsYaml.match(/username: "(.+)"/)[1];
      ctrl.project = cloudsYaml.match(/project_name: "(.+)"/)[1];
      ctrl.userDomain = cloudsYaml.match(/user_domain_name: "(.+)"/);
      ctrl.projectDomain = cloudsYaml.match(/project_domain_name: "(.+)"/);
      ctrl.domain = (ctrl.userDomain.length === 2) ? ctrl.userDomain[1] : ctrl.projectDomain[1];
      ctrl.region = cloudsYaml.match(/region_name: "(.+)"/)[1];

      // container name
      ctrl.containerLabel = "cloud-shell-" + ctrl.user + "-" + ctrl.project +
        "-" + ctrl.domain + "-" + ctrl.region;

      // get container
      zun.getContainers().then(findContainer);
    });

    function findContainer(response) {
      var container = response.data.items.find(function(item) {
        return item.labels['cloud-shell'] === ctrl.containerLabel;
      });

      if (typeof (container) === 'undefined') {
        onFailGetContainer();
      } else {
        onGetContainer({data: container});
      }
    }

    function onGetContainer(response) {
      ctrl.container = response.data;

      // attach console to existing container
      ctrl.consoleUrl = webRoot + "containers/" + ctrl.container.id + "/console";
      var console = $("<p>To display console, interactive mode needs to be enabled " +
        "when this container was created.</p>");
      if (ctrl.container.status !== "Running") {
        console = $("<p>Container is not running. Please wait for starting up container.</p>");
      } else if (ctrl.container.interactive) {
        console = $("<iframe id=\"console_embed\" src=\"" + ctrl.consoleUrl +
          "\" style=\"width:100%;height:100%\"></iframe>");

        // execute openrc.sh on the container
        var command = "sh -c 'printf \"" + cloudsYaml + "\" > ~/.config/openstack/clouds.yaml'";
        zun.executeContainer(ctrl.container.id, {command: command}).then(function() {
          var command = "sh -c 'printf \"export OS_CLOUD=openstack\" > ~/.bashrc'";
          zun.executeContainer(ctrl.container.id, {command: command}).then(function() {
            angular.noop();
          });
        });
      }
      // append shell content
      angular.element("#shell-content").append(console);
    }

    // watcher for iframe contents loading, seems to emit once.
    $scope.$watch(function() {
      return angular.element("#shell-content > iframe").contents()
        .find("#terminalNode").attr("termCols");
    }, resizeTerminal);
    // event handler to resize console according to window resize.
    angular.element(window).bind('resize', resizeTerminal);
    // also, add resizeTerminal into callback attribute for resizer directive
    function resizeTerminal() {
      var shellIframe = angular.element("#shell-content > iframe");
      var newCols = shellIframe.contents().find("#terminalNode").attr("termCols");
      var newRows = shellIframe.contents().find("#terminalNode").attr("termRows");
      if ((newCols !== cols || newRows !== rows) && newCols > 0 && newRows > 0 &&
        ctrl.container.id) {
        // resize tty
        zun.resizeContainer(ctrl.container.id, {width: newCols, height: newRows}).then(function() {
          cols = newCols;
          rows = newRows;
        });
      }
    }

    function onFailGetContainer() {
      // create new container and attach console to it.
      var image = angular.element("#cloud-shell-menu").attr("cloud-shell-image");
      var model = {
        image: image,
        command: "/bin/bash",
        interactive: true,
        run: true,
        environment: "OS_CLOUD=openstack",
        labels: "cloud-shell=" + ctrl.containerLabel
      };
      zun.createContainer(model).then(function (response) {
        // attach
        onGetContainer({data: {id: response.data.id}});
      });
    }

    function openInNewWindow() {
      // open shell in new window
      window.open(ctrl.consoleUrl, "_blank");
      closeShell();
    }

    function closeShell() {
      // close shell
      angular.element("#cloud-shell").remove();
      angular.element("#cloud-shell-resizer").remove();
    }
  }
})();
