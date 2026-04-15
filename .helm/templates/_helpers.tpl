{{- define "op.datadog" -}}
tags.datadoghq.com/organization: "mmtc"
tags.datadoghq.com/env: "{{ .Values.mainsecret.nonSensitive.namespace }}"
tags.datadoghq.com/service: "{{ .Values.mainsecret.nonSensitive.appname }}"
tags.datadoghq.com/version: {{ .Values.app.version }}
{{- end -}}

{{- define "op.ddlabel" -}}
app: {{ .Values.mainsecret.nonSensitive.appname }}
version: {{ .Values.app.version }}
tags.datadoghq.com/organization: "{{ .Values.app.organization }}"
tags.datadoghq.com/env: "{{ .Values.mainsecret.nonSensitive.namespace }}"
tags.datadoghq.com/service: "{{ .Values.mainsecret.nonSensitive.appname }}"
tags.datadoghq.com/version: {{ .Values.app.version }}
{{- end -}}