function runDecoder(msg) {
    const payload = msg.payload;
    const metadata = msg.metadata;

    const res = {};
    const sensorId = payload.deviceInfo.devEui.slice(-4);
    res.id = `refrigerator-sensor:${sensorId}-Milesight`;
    res.type = "refrigerator-sensor";

    const decoded = payload.data;
    const timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();

    res.name = {
        type: "Property",
        value: metadata.name
    };

    if (decoded.temperature !== undefined) {
        res.temperature = {
            type: "Property",
            value: decoded.temperature,
            observedAt: timestamp
        };
    }

    if (decoded.humidity !== undefined) {
        res.humidity = {
            type: "Property",
            value: decoded.humidity,
            observedAt: timestamp
        };
    }

    if (decoded.battery !== undefined) {
        res.battery = {
            type: "Property",
            value: decoded.battery,
            observedAt: timestamp
        };
    }

    let metadataFields;
    try {
        metadataFields = JSON.parse(metadata.metadata);
    } catch (err) {
        metadataFields = null;
    }

    if (metadataFields) {
        if (metadataFields.Afdeling) {
            res.department = {
                type: "Property",
                value: metadataFields.Afdeling
            };
        }
        if (metadataFields.Enhed) {
            res.appliance = {
                type: "Property",
                value: metadataFields.Enhed
            };
        }
        if (metadataFields.Lokale) {
            res.room = {
                type: "Property",
                value: metadataFields.Lokale
            };
        }
        if (metadataFields.Etage) {
            res.floor = {
                type: "Property",
                value: metadataFields.Etage
            };
        }
    }
    return res;
}
