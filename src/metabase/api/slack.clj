(ns metabase.api.slack
  "/api/slack endpoints"
  (:require [clojure.java.io :as io]
            [compojure.core :refer [PUT]]
            [metabase.api.common :as api]
            [metabase.config :as config]
            [metabase.integrations.slack :as slack]
            [metabase.util.i18n :refer [tru]]
            [metabase.util.schema :as su]
            [schema.core :as s]))

(api/defendpoint PUT "/settings"
  "Update Slack related settings. You must be a superuser to do this. Also updates the slack-cache.
  There are 3 cases where we alter the slack-cache:
  1. falsy token           -> clear
  2. invalid token         -> clear
  3. truthy, valid token   -> refresh
  "

  [:as {{slack-app-token :slack-app-token, slack-files-channel :slack-files-channel} :body}]
  {slack-app-token     (s/maybe su/NonBlankString)
   slack-files-channel (s/maybe su/NonBlankString)}
  (api/check-superuser)
  (try
    (when (and slack-app-token
               (not config/is-test?)
               (not (slack/valid-token? slack-app-token)))
      (slack/cached-channel-and-user-names {})
      (throw (ex-info (tru "Invalid Slack token.")
                      {:errors {:slack-app-token (tru "invalid token")}})))
    (slack/slack-app-token slack-app-token)
    (if slack-app-token
      (do (slack/slack-token-valid? true)
          ;; Clear the deprecated `slack-token` when setting a new `slack-app-token`
          (slack/slack-token nil)
          ;; refresh their token when it is valid
          (future (slack/refresh-cache!)))
      ;; app-token set to nil => clear user/conversation cache
      (slack/cached-channel-and-user-names {}))
    (let [processed-files-channel (slack/process-files-channel-name slack-files-channel)]
      (when (and processed-files-channel (not (slack/channel-with-name processed-files-channel)))
        (throw (ex-info (tru "Slack channel not found.")
                        {:errors {:slack-files-channel (tru "channel not found")}})))
      (slack/slack-files-channel processed-files-channel))
    {:ok true}
    (catch clojure.lang.ExceptionInfo info
      {:status 400, :body (ex-data info)})))

(def ^:private slack-manifest
  (delay (slurp (io/resource "slack-manifest.yaml"))))

(api/defendpoint GET "/manifest"
  "Returns the YAML manifest file that should be used to bootstrap new Slack apps"
  []
  (api/check-superuser)
  @slack-manifest)

(api/define-routes)
