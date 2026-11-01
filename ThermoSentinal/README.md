# 🔥 ThermoSentinal

### AI-Powered Satellite Thermal Intelligence & Industrial Fire Detection Platform

ThermoSentinal is an AI-powered geospatial intelligence platform designed to detect, classify, and monitor thermal anomalies and potential industrial fires using satellite-based thermal data.

Instead of treating every satellite hotspot as a fire, ThermoSentinal combines **NASA FIRMS thermal observations, geographical context, industrial facility data, historical behavior, and AI-based analysis** to determine what a thermal anomaly is and whether it represents a potential abnormal event.

---

## 🚨 Problem Statement

Satellite-based fire detection systems can identify thermal hotspots, but a hotspot alone does not explain its cause.

A thermal anomaly may represent:

- 🏭 Normal industrial activity
- 🔥 Accidental industrial fire
- 🌲 Wildfire
- 🌾 Agricultural burning
- ⛏️ Mining or coal fire
- 🌡️ Persistent industrial thermal source
- ❓ Unknown / requires verification

This creates a major challenge for monitoring industrial areas and identifying potentially dangerous events.

**ThermoSentinal addresses this problem by adding intelligence and context to satellite thermal observations.**

---

## 🎯 Objectives

- Detect thermal anomalies using satellite data.
- Identify and classify different types of thermal sources.
- Distinguish normal industrial thermal activity from abnormal events.
- Analyze the historical behavior of thermal hotspots.
- Correlate hotspots with nearby industrial facilities.
- Assign risk levels to detected anomalies.
- Provide an interactive GIS-based monitoring dashboard.
- Reduce false alarms by combining multiple contextual features.
- Provide explainable insights behind AI classifications.

---

## 🛰️ Data Source

ThermoSentinal uses **NASA FIRMS (Fire Information for Resource Management System)** for satellite-based thermal anomaly observations.

The system can utilize information such as:

- Latitude
- Longitude
- Acquisition date and time
- Brightness temperature
- Fire Radiative Power (FRP)
- Detection confidence
- Satellite source
- Day/night observation

FIRMS provides the thermal observations, while ThermoSentinal performs the additional analysis required to understand the nature of the hotspot.

---

## 🧠 How ThermoSentinal Works

```text
              🛰️ Satellite Data
                     │
                     ▼
              NASA FIRMS Data
                     │
                     ▼
             🔥 Thermal Hotspot
                     │
                     ▼
            Geospatial Context
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
     Industrial   Land Cover   Historical
     Facilities     Data        Behavior
          │          │          │
          └──────────┼──────────┘
                     ▼
              🤖 AI Analysis
                     │
                     ▼
              Classification
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      Normal Source          Abnormal Event
          │                     │
          └──────────┬──────────┘
                     ▼
                Risk Analysis
                     │
                     ▼
              📊 GIS Dashboard
