export function getErrorMessage(err) {
    if (!err) return "Unknown error";
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data) return JSON.stringify(err.response.data);
    return err.message || String(err);
}
