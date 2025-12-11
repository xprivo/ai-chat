export interface QuotaInfo {
  requests_remaining: number;
  expires: number;
  status: 'renews' | 'ends';
  expired: boolean;
}

export async function fetchQuotaInfo(proKey: string): Promise<QuotaInfo | null> {
  try {
    const response = await fetch('https://www.xprivo.com/auth/quota', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pro_key: proKey })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quota info');
    }

    const data = await response.json();
    return {
      requests_remaining: data.requests_remaining,
      expires: data.expires,
      status: data.status,
      expired: data.expired
    };
  } catch (error) {
    console.error('Error fetching quota info');
    return null;
  }
}
