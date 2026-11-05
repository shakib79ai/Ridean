// Business account — board "Business". Mirrors apps/pwa/src/app/account/business/page.tsx.
// Left out (no backend): "Billed monthly · Net 30" (replaced by the billing email) and PDF/CSV statement
// downloads (the "Monthly statements" row opens Invoices, where business trips are listed).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// "Approval over $200" ↔ policy.approvalOver in minor units.
const _approvalLimit = 20000;

String _noCents(String s) => s.endsWith('.00') ? s.substring(0, s.length - 3) : s;

String _memberInitials(BusinessMember m) {
  final name = m.name;
  final src = (name != null && name.trim().isNotEmpty ? name : m.email.split('@').first).trim();
  final parts = src.split(RegExp(r'[\s._-]+')).where((p) => p.isNotEmpty).toList();
  final s = '${parts.isNotEmpty ? parts[0][0] : ''}${parts.length > 1 ? parts[1][0] : ''}'.toUpperCase();
  return s.isEmpty ? '?' : s;
}

final _emailRe = RegExp(r'^\S+@\S+\.\S+$');

class BusinessScreen extends ConsumerStatefulWidget {
  const BusinessScreen({super.key});
  @override
  ConsumerState<BusinessScreen> createState() => _BusinessScreenState();
}

class _BusinessScreenState extends ConsumerState<BusinessScreen> {
  /// Latest account returned by a mutation; shown in preference to the provider's value.
  BusinessAccount? _b;

  // Setup form
  final _name = TextEditingController();
  final _budget = TextEditingController();
  final _billing = TextEditingController();

  // Invite form
  final _invEmail = TextEditingController();
  final _invName = TextEditingController();
  String _invRole = 'member';
  bool _inviting = false;

  String _busy = '';
  String _error = '';

  @override
  void initState() {
    super.initState();
    _billing.text = ref.read(authProvider).user?.email ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _budget.dispose();
    _billing.dispose();
    _invEmail.dispose();
    _invName.dispose();
    super.dispose();
  }

  void _apply(BusinessAccount b) {
    _b = b;
    ref.invalidate(businessProvider);
  }

  Future<void> _create() async {
    final name = _name.text.trim();
    if (name.length < 2) {
      setState(() => _error = 'Please enter your company name.');
      return;
    }
    final raw = _budget.text.replaceAll(RegExp(r'[,$\s]'), '');
    double? dollars;
    if (raw.isNotEmpty) {
      dollars = double.tryParse(raw);
      if (dollars == null || dollars < 0 || dollars.isNaN || dollars.isInfinite) {
        setState(() => _error = 'Please enter a valid monthly budget.');
        return;
      }
    }
    final billing = _billing.text.trim();
    setState(() {
      _error = '';
      _busy = 'create';
    });
    try {
      final b = await ref.read(apiProvider).createBusiness(
            name: name,
            monthlyBudget: dollars == null ? null : (dollars * 100).round(),
            billingEmail: billing.isEmpty ? null : billing,
          );
      if (!mounted) return;
      setState(() => _apply(b));
      showRdToast(context, 'Business account created');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _setPolicy(BusinessAccount b, Map<String, dynamic> patch) async {
    if (!b.isAdmin || _busy.isNotEmpty) return;
    setState(() => _busy = 'policy');
    try {
      final nb = await ref.read(apiProvider).updateBusiness({'policy': patch});
      if (!mounted) return;
      setState(() => _apply(nb));
      showRdToast(context, 'Policy updated');
    } catch (e) {
      if (!mounted) return;
      showRdToast(context, errorText(e, 'Couldn’t update the policy'));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _invite() async {
    final email = _invEmail.text.trim();
    if (!_emailRe.hasMatch(email)) {
      setState(() => _error = 'Please enter a valid email address.');
      return;
    }
    setState(() {
      _error = '';
      _busy = 'invite';
    });
    try {
      final nb = await ref.read(apiProvider).inviteBusinessMember(email: email, name: _invName.text.trim(), role: _invRole);
      if (!mounted) return;
      _invEmail.clear();
      _invName.clear();
      setState(() {
        _apply(nb);
        _invRole = 'member';
        _inviting = false;
      });
      showRdToast(context, 'Invitation added');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _remove(BusinessAccount b, BusinessMember m) async {
    final ok = await rdConfirm(context, title: 'Remove member', message: 'Remove ${m.displayName} from ${b.name}?', confirm: 'Remove', danger: true);
    if (!ok || !mounted) return;
    setState(() {
      _error = '';
      _busy = m.id;
    });
    try {
      final nb = await ref.read(apiProvider).removeBusinessMember(m.id);
      if (!mounted) return;
      setState(() => _apply(nb));
      showRdToast(context, 'Member removed');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _refresh() async {
    _b = null;
    await ref.refresh(businessProvider.future);
  }

  @override
  Widget build(BuildContext context) {
    final biz = ref.watch(businessProvider);
    final b = _b ?? biz.valueOrNull;

    if (b == null) {
      if (biz.isLoading) {
        return const RdPage(title: 'Business account', children: [RdLoading(height: 130), RdLoading(height: 180)]);
      }
      if (biz.hasError) {
        return RdPage(title: 'Business account', children: [RdError(biz.error!, onRetry: () => ref.invalidate(businessProvider))]);
      }
      return RdPage(
        title: 'Business account',
        subtitle: 'Travel for work, billed in one place',
        children: [_setupPanel()],
      );
    }
    return _account(b);
  }

  Widget _setupPanel() {
    return RdCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: rdGap([
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const RdIconTile(Icons.work_outline_rounded),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Set up Ridean Business', style: RdText.serif(19)),
                const SizedBox(height: 4),
                Text('Bill team trips to one account, set a monthly budget and a simple travel policy.', style: RdText.sans(13, color: RdColors.muted, height: 1.5)),
              ]),
            ),
          ]),
          RdField(
            label: 'Company name',
            icon: Icons.work_outline_rounded,
            controller: _name,
            hint: 'Your company',
            textCapitalization: TextCapitalization.words,
            autofillHints: const [AutofillHints.organizationName],
            textInputAction: TextInputAction.next,
          ),
          RdField(
            label: 'Monthly budget (USD, optional)',
            icon: Icons.sell_outlined,
            controller: _budget,
            hint: '5,000',
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            textInputAction: TextInputAction.next,
          ),
          RdField(
            label: 'Billing email',
            icon: Icons.mail_outline_rounded,
            controller: _billing,
            hint: 'billing@company.com',
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _create(),
          ),
          if (_error.isNotEmpty) RdErrorText(_error),
          RdCta(label: 'Create business account', arrow: false, busy: _busy == 'create', onPressed: _create),
        ], 12),
      ),
    );
  }

  Widget _account(BusinessAccount b) {
    final admin = b.isAdmin;
    final pct = b.monthlyBudget > 0 ? (b.spendThisMonth / b.monthlyBudget).clamp(0.0, 1.0) : 0.0;
    final me = (ref.watch(authProvider).user?.email ?? '').toLowerCase();
    final approvalLabel = 'Approval over ${_noCents(formatMoney(b.policy.approvalOver > 0 ? b.policy.approvalOver : _approvalLimit, b.currency))}';
    final policyBusy = _busy.isNotEmpty;

    return RdPage(
      title: 'Business account',
      subtitle: b.name,
      onRefresh: _refresh,
      children: [
        // Spend this month
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text('Spend this month', style: RdText.sans(12.5, color: RdColors.muted)),
            const SizedBox(height: 4),
            Wrap(crossAxisAlignment: WrapCrossAlignment.end, spacing: 8, runSpacing: 2, children: [
              Text(formatMoney(b.spendThisMonth, b.currency), style: RdText.serif(32)),
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(b.monthlyBudget > 0 ? 'of ${formatMoney(b.monthlyBudget, b.currency)} budget' : 'no budget set', style: RdText.sans(13, color: RdColors.muted)),
              ),
            ]),
            const SizedBox(height: 12),
            Semantics(
              label: 'Budget used',
              value: '${(pct * 100).round()}%',
              child: Container(
                height: 8,
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(color: RdColors.iconTile, borderRadius: BorderRadius.circular(4)),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: pct,
                    heightFactor: 1,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: pct >= 1 ? RdColors.bad : null,
                        gradient: pct >= 1 ? null : const LinearGradient(colors: [Color(0xFFF2D27A), RdColors.yellow]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(children: [
              Text('${b.tripsThisMonth} trip${b.tripsThisMonth == 1 ? '' : 's'}', style: RdText.sans(12, color: RdColors.muted)),
              const SizedBox(width: 10),
              if (b.billingEmail != null && b.billingEmail!.isNotEmpty)
                Expanded(
                  child: Text('Billing · ${b.billingEmail}', textAlign: TextAlign.right, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12, color: RdColors.muted)),
                ),
            ]),
          ]),
        ),

        if (_error.isNotEmpty && !_inviting) RdErrorText(_error),

        RdSectionTitle(
          'Team',
          action: admin && !_inviting ? 'Invite' : null,
          onAction: () => setState(() {
            _inviting = true;
            _error = '';
          }),
        ),

        if (_inviting)
          RdCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: rdGap([
                RdField(
                  label: 'Email',
                  icon: Icons.mail_outline_rounded,
                  controller: _invEmail,
                  hint: 'colleague@company.com',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                ),
                RdField(
                  label: 'Name (optional)',
                  icon: Icons.person_outline_rounded,
                  controller: _invName,
                  textCapitalization: TextCapitalization.words,
                  textInputAction: TextInputAction.done,
                ),
                Row(children: [
                  Text('Role', style: RdText.sans(13, color: RdColors.muted)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: RdChips<String>(
                      options: const [('member', 'Member'), ('admin', 'Admin')],
                      value: _invRole,
                      onChanged: (v) => setState(() => _invRole = v),
                    ),
                  ),
                ]),
                if (_error.isNotEmpty) RdErrorText(_error),
                Row(children: [
                  Expanded(
                    child: RdOutlineButton(
                      label: 'Cancel',
                      height: 54,
                      onPressed: _busy == 'invite'
                          ? null
                          : () => setState(() {
                                _inviting = false;
                                _error = '';
                              }),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(flex: 2, child: RdCta(label: 'Invite member', arrow: false, busy: _busy == 'invite', onPressed: _invite)),
                ]),
                Text('They’ll join the account when they sign in to Ridean with this email.', style: RdText.sans(12.5, color: RdColors.muted, height: 1.4)),
              ], 12),
            ),
          ),

        if (b.members.isEmpty)
          RdCard(child: Text('No team members yet.', style: RdText.sans(14, color: RdColors.muted)))
        else
          RdListGroup(children: [
            for (final m in b.members)
              _MemberRow(
                member: m,
                currency: b.currency,
                self: m.email.toLowerCase() == me,
                onRemove: admin && m.email.toLowerCase() != me && _busy.isEmpty ? () => _remove(b, m) : null,
                showRemove: admin && m.email.toLowerCase() != me,
              ),
          ]),

        const RdSectionTitle('Travel policy'),
        RdListGroup(children: [
          RdToggleRow(
            title: 'Require trip purpose',
            value: b.policy.requirePurpose,
            onChanged: admin && !policyBusy ? (v) => _setPolicy(b, {'requirePurpose': v}) : null,
          ),
          RdToggleRow(
            title: 'Business class and above',
            subtitle: 'Allow premium vehicles',
            value: b.policy.businessClassOnly,
            onChanged: admin && !policyBusy ? (v) => _setPolicy(b, {'businessClassOnly': v}) : null,
          ),
          RdToggleRow(
            title: approvalLabel,
            subtitle: 'Manager approves large bookings',
            value: b.policy.approvalOver > 0,
            onChanged: admin && !policyBusy ? (v) => _setPolicy(b, {'approvalOver': v ? _approvalLimit : 0}) : null,
          ),
        ]),
        if (!admin) Text('Only account admins can change the travel policy.', style: RdText.sans(12.5, color: RdColors.muted)),

        RdListGroup(children: [
          RdListTile(
            icon: Icons.description_outlined,
            title: 'Monthly statements',
            subtitle: 'Your business trips are on your invoices',
            onTap: () => context.push('/account/invoices'),
          ),
        ]),
      ],
    );
  }
}

class _MemberRow extends StatelessWidget {
  const _MemberRow({required this.member, required this.currency, required this.self, required this.onRemove, required this.showRemove});
  final BusinessMember member;
  final String currency;
  final bool self;
  final VoidCallback? onRemove;
  final bool showRemove;
  @override
  Widget build(BuildContext context) {
    final m = member;
    final trips = '${m.tripsThisMonth} trip${m.tripsThisMonth == 1 ? '' : 's'}';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(children: [
        Container(
          width: 38,
          height: 38,
          alignment: Alignment.center,
          decoration: const BoxDecoration(shape: BoxShape.circle, color: RdColors.iconTile),
          child: Text(_memberInitials(m), style: RdText.serif(14, weight: FontWeight.w700, color: RdColors.gold)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text.rich(
              TextSpan(children: [
                TextSpan(text: m.displayName),
                if (self) TextSpan(text: ' (you)', style: RdText.sans(14.5, color: RdColors.muted)),
              ]),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: RdText.sans(14.5),
            ),
            const SizedBox(height: 2),
            Wrap(crossAxisAlignment: WrapCrossAlignment.center, spacing: 6, runSpacing: 4, children: [
              Text('${m.role == 'admin' ? 'Admin' : 'Member'} · $trips · ${formatMoney(m.spendThisMonth, currency)}', style: RdText.sans(12, color: RdColors.muted)),
              if (m.status == 'invited') const RdBadge('Invited'),
            ]),
          ]),
        ),
        if (showRemove)
          SizedBox(
            width: 36,
            height: 36,
            child: IconButton(
              padding: EdgeInsets.zero,
              onPressed: onRemove,
              tooltip: 'Remove ${m.displayName}',
              icon: const Icon(Icons.delete_outline_rounded, size: 19, color: RdColors.muted),
            ),
          ),
      ]),
    );
  }
}
