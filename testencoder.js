function runDecoder(msg) {
    function readUInt16LE(bytes) {
        return (bytes[1] << 8) + bytes[0];
    }

    function readInt16LE(bytes) {
        const val = readUInt16LE(bytes);
        return val > 0x7FFF ? val - 0x10000 : val;
    }

    function readUInt32LE(bytes) {
        return (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    }

    function base64ToHex(str) {
        const raw = Buffer.from(str, 'base64');
        return raw.toString('hex').toUpperCase();
    }

    function getHex(val) {
        const bytes = [];
        for (let i = 0; i < val.length; i += 2) {
            bytes.push(parseInt(val.substr(i, 2), 16));
        }
        return bytes;
    }

    function Decoder(bytes, fPort) {
        const decoded = {};
        let i = 0;

        while (i < bytes.length) {
            const channel_id = bytes[i++];
            const channel_type = bytes[i++];

            if (channel_id === 0x01 && channel_type === 0x75) {
                decoded.battery = bytes[i++];
            }
            else if (channel_id === 0x03 && channel_type === 0x67) {
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
            }
            else if (channel_id === 0x04 && channel_type === 0x68) {
                decoded.humidity = bytes[i++] / 2;
            }
            else if (channel_id === 0x20 && channel_type === 0xce) {
                const point = {};
                point.nsTimestamp = readUInt32LE(bytes.slice(i, i + 4));
                point.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
                point.humidity = bytes[i + 6] / 2;
                decoded.history = decoded.history || [];
                decoded.history.push(point);
                i += 7;
            }
            else {
                break;
            }
        }

        return decoded;
    }

	const payload = msg.payload;
	const metadata = msg.metadata;

	const res = {};
	const rawPayload = base64ToHex(payload.data);
	const decoded = Decoder(getHex(rawPayload), payload.fPort);
	const timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();
	res.payload = payload;
	res.payload.data = decoded;
	res.metadata = metadata;

return [res];
}
