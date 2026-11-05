// Account tab — boards "Profile" + "ProfilePlatforms". Mirrors apps/pwa/src/app/(tabs)/account/page.tsx.
// Left out (no backend): the "Ridean+ Gold" tier badge and the "Rating" tile. The badge slot shows
// "Member since <year>" and the middle tile shows the saved-places count, as in the PWA.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    final ok = await rdConfirm(context, title: 'Sign out', message: 'Are you sure you want to sign out of Ridean?', confirm: 'Sign out', danger: true);
    if (!ok) return;
    if (!context.mounted) return;
    // Leave the protected tab first so the auth redirect doesn't send us to Sign in.
    final auth = ref.read(authProvider);
    context.go('/');
    await auth.logout();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final bookings = ref.watch(bookingsProvider);
    final addresses = ref.watch(addressesProvider);
    final wallet = ref.watch(walletProvider);
    final cards = ref.watch(paymentMethodsProvider);
    final business = ref.watch(businessProvider);

    final now = DateTime.now();
    String? tripsValue;
    final bl = bookings.valueOrNull;
    if (bl != null) {
      final n = bl.where((b) {
        if (b.status == 'completed') return true;
        if (b.status == 'cancelled' || b.status == 'failed') return false;
        final d = parseDate(b.pickupAt);
        return d != null && d.isBefore(now);
      }).length;
      tripsValue = '$n';
    } else if (bookings.hasError) {
      tripsValue = '—';
    }

    final addr = addresses.valueOrNull;
    final placesValue = addr != null ? '${addr.length}' : (addresses.hasError ? '—' : null);
    final w = wallet.valueOrNull;
    final walletValue = w != null ? formatMoney(w.balance, w.currency) : (wallet.hasError ? '—' : null);

    final cl = cards.valueOrNull;
    SavedCard? def;
    if (cl != null && cl.isNotEmpty) {
      def = cl.first;
      for (final c in cl) {
        if (c.isDefault) {
          def = c;
          break;
        }
      }
    }
    final cardSub = cl != null ? (def != null ? def.label : 'Add a card') : (cards.hasError ? 'Cards, wallet and business' : ' ');

    final String addrSub;
    if (addr == null) {
      addrSub = addresses.hasError ? 'Home, work and favourite places' : ' ';
    } else if (addr.isEmpty) {
      addrSub = 'Add home or work';
    } else if (addr.length <= 2) {
      addrSub = addr.map((a) => a.label).join(', ');
    } else {
      addrSub = '${addr.take(2).map((a) => a.label).join(', ')} + ${addr.length - 2}';
    }

    final biz = business.valueOrNull;
    final bizSub = biz != null ? biz.name : (business.isLoading ? ' ' : 'Set up');

    final createdAt = parseDate(user?.createdAt);

    Future<void> refresh() async {
      ref.invalidate(addressesProvider);
      ref.invalidate(walletProvider);
      ref.invalidate(paymentMethodsProvider);
      ref.invalidate(businessProvider);
      final _ = await ref.refresh(bookingsProvider.future);
    }

    return RdTabPage(
      header: RdBrandHeader(onAction: () => context.push('/account/settings')),
      onRefresh: refresh,
      children: [
        RdCard(
          child: Row(children: [
            RdAvatar(user?.initials ?? ''),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(user?.fullName ?? '', maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.serif(22)),
                Padding(
                  padding: const EdgeInsets.only(top: 3),
                  child: Text(user?.email ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(13, color: RdColors.muted)),
                ),
                if (createdAt != null) Padding(padding: const EdgeInsets.only(top: 8), child: RdBadge('Member since ${createdAt.year}', icon: Icons.calendar_today_outlined)),
              ]),
            ),
            IconButton(
              onPressed: () => context.push('/account/edit'),
              tooltip: 'Edit profile',
              icon: const Icon(Icons.edit_outlined, color: RdColors.gold, size: 19),
            ),
          ]),
        ),
        Row(children: [
          Expanded(child: _Tile(value: tripsValue, label: 'Trips')),
          const SizedBox(width: 10),
          Expanded(child: _Tile(value: placesValue, label: 'Saved places')),
          const SizedBox(width: 10),
          Expanded(child: _Tile(value: walletValue, label: 'Wallet')),
        ]),
        RdListGroup(children: [
          RdListTile(icon: Icons.person_outline_rounded, title: 'Edit profile', subtitle: 'Name, phone, email', onTap: () => context.push('/account/edit')),
          RdListTile(icon: Icons.credit_card_outlined, title: 'Payment methods', subtitle: cardSub, onTap: () => context.push('/account/payment-methods')),
          RdListTile(icon: Icons.location_on_outlined, title: 'Saved addresses', subtitle: addrSub, onTap: () => context.push('/account/addresses')),
          RdListTile(icon: Icons.work_outline_rounded, title: 'Business account', subtitle: bizSub, onTap: () => context.push('/account/business')),
          RdListTile(icon: Icons.description_outlined, title: 'Invoices', subtitle: 'Receipts and tax invoices', onTap: () => context.push('/account/invoices')),
          RdListTile(icon: Icons.notifications_none_rounded, title: 'Settings', subtitle: 'Notifications, language', onTap: () => context.push('/account/settings')),
          RdListTile(icon: Icons.help_outline_rounded, title: 'Help & support', subtitle: '24/7 chauffeur support', onTap: () => context.push('/help')),
          RdListTile(icon: Icons.verified_user_outlined, title: 'Legal & privacy', subtitle: 'Terms, data and cookies', onTap: () => context.push('/legal')),
        ]),
        _SignOutButton(onTap: () => _signOut(context, ref)),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.value, required this.label});
  final String? value;
  final String label;
  @override
  Widget build(BuildContext context) {
    final v = value;
    return RdCard(
      padding: const EdgeInsets.all(12),
      child: Column(children: [
        SizedBox(
          height: 30,
          child: v == null
              ? const Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: RdColors.gold)))
              : Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(v, maxLines: 1, style: RdText.serif(v.length > 7 ? 17 : 22)),
                  ),
                ),
        ),
        const SizedBox(height: 2),
        Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(11.5, color: RdColors.muted)),
      ]),
    );
  }
}

class _SignOutButton extends StatelessWidget {
  const _SignOutButton({required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          height: 50,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.logout_rounded, size: 19, color: RdColors.bad),
            const SizedBox(width: 10),
            Text('Sign out', style: RdText.sans(15, weight: FontWeight.w600, color: RdColors.bad)),
          ]),
        ),
      ),
    );
  }
}
